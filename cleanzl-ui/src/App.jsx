import { useState } from 'react'
import './App.css'

function App() {
  // Tasks state
  const [tasks, setTasks] = useState([
    'Build CleanZL UI',
    'Integrate API',
    'Deploy to Cloudflare Pages',
  ])
  const [newTask, setNewTask] = useState('')

  // Counter state
  const [count, setCount] = useState(0)

  // Add task
  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, newTask])
      setNewTask('')
    }
  }

  // Remove task
  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index)
    setTasks(updatedTasks)
  }

  return (
    <div className="app">
      <header>
        <h1>CleanZL Project Dashboard</h1>
      </header>

      <section className="counter-card">
        <h2>Project Counter</h2>
        <button onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </button>
      </section>

      <section className="task-card">
        <h2>Tasks</h2>
        <div className="task-input">
          <input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button onClick={addTask}>Add Task</button>
        </div>
        <ul className="task-list">
          {tasks.map((task, index) => (
            <li key={index}>
              {task}{' '}
              <button className="remove-btn" onClick={() => removeTask(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="deployment-card">
        <h2>Deployment Status</h2>
        <p>
          Default domain: <strong>cleanzl-ui.pages.dev</strong>
        </p>
        <p>Status: <span className="status">✅ Live</span></p>
      </section>
    </div>
  )
}

export default App