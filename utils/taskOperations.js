import fs from 'fs';
import path from 'path';

const tasksPath = path.join(process.cwd(), 'tasks.json');

export const getAllTasks = () => {
  // Read tasks from tasks.json
};

export const addTask = (task) => {
  // Append task to tasks.json
};

export const editTask = (updatedTask) => {
  // Update task in tasks.json
};

export const deleteTask = (taskId) => {
  // Remove task from tasks.json
};
