"use client"

import React, { useState, useEffect } from "react";
import NavBar from "../../../component/navBar";

// Define Todo type to match your backend schema
type Todo = {
  id: number;
  task: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export default function ToDo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8080/get/todos');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setTodos(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch todos:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim() !== "") {
      try {
        const response = await fetch('http://localhost:8080/create/todo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ task: newTodo }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const newTodoFromServer = await response.json();
        setTodos([...todos, newTodoFromServer]);
        setNewTodo("");
        setIsModalOpen(false);
      } catch (err) {
        console.error('Failed to add todo:', err);
        setError('Failed to add task. Please try again.');
      }
    }
  };

  const toggleComplete = async (id: number) => {
    try {
      const response = await fetch('http://localhost:8080/update/task_status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const updatedTodo = await response.json();
      setTodos(
        todos.map((todo) =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch('http://localhost:8080/delete/todo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 mb-6">No tasks yet. Create your first task!</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
              >
                Create Task
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todos.map((todo) => (
                <li key={todo.id} className="py-4 flex justify-between items-center group">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id)}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`ml-4 text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {todo.task}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Progress Summary */}
        {!isLoading && todos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress</h2>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {todos.filter(t => t.completed).length} of {todos.length} tasks completed
                </span>
                <span className="text-sm font-medium text-indigo-600">
                  {Math.round((todos.filter(t => t.completed).length / todos.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(todos.filter(t => t.completed).length / todos.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Task</h2>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addTodo()}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}