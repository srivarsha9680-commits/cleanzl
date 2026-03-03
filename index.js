export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS (for frontend)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ───────── HEALTH ─────────
    if (url.pathname === "/health") {
      return Response.json(
        { status: "ok", timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }

    // ───────── BOOKING API ─────────
    if (url.pathname === "/api/book" && request.method === "POST") {
      const body = await request.json();
      const { service, postcode, date, email } = body;

      if (!service || !postcode || !date || !email) {
        return Response.json({ error: "All fields required." }, { status: 400 });
      }

      const id = crypto.randomUUID();

      await env.DB.prepare(`
        INSERT INTO bookings (id, service, postcode, date, email, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        service,
        postcode,
        date,
        email,
        "pending",
        new Date().toISOString()
      ).run();

      return Response.json(
        {
          success: true,
          bookingId: id,
          message: "Booking received."
        },
        { status: 201, headers: corsHeaders }
      );
    }

    // ───────── APPLY API ─────────
    if (url.pathname === "/api/apply" && request.method === "POST") {
      const body = await request.json();
      const { name, email, phone, city } = body;

      if (!name || !email || !phone || !city) {
        return Response.json({ error: "All fields required." }, { status: 400 });
      }

      const id = crypto.randomUUID();

      await env.DB.prepare(`
        INSERT INTO applications (id, name, email, phone, city, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        name,
        email,
        phone,
        city,
        "pending_review",
        new Date().toISOString()
      ).run();

      return Response.json(
        {
          success: true,
          applicationId: id,
          message: "Application received."
        },
        { status: 201, headers: corsHeaders }
      );
    }

    // ───────── ADMIN AUTH ─────────
    const ADMIN_PASS = "changeme123";

    if (url.pathname.startsWith("/api/admin")) {
      const auth = request.headers.get("Authorization");
      if (!auth || auth !== `Bearer ${ADMIN_PASS}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (url.pathname === "/api/admin/bookings") {
        const data = await env.DB.prepare("SELECT * FROM bookings")
          .all();
        return Response.json({ count: data.results.length, bookings: data.results });
      }

      if (url.pathname === "/api/admin/applications") {
        const data = await env.DB.prepare("SELECT * FROM applications")
          .all();
        return Response.json({ count: data.results.length, applications: data.results });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};