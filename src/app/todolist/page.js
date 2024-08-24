'use client';
import React, { useState, useEffect, useMemo } from 'react'; // <-- Import useEffect here
import { Layout, Input, Button, List, Checkbox, Tag, DatePicker, Select, Modal, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import styles from './TodoList.module.css';
import Confetti from 'react-confetti'; // Make sure Confetti is imported if used

const { Content } = Layout;
const { Option } = Select;

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Categories with colors
  const hashtags = [
    { value: 'work', label: '#Work', color: '#f50' },
    { value: 'personal', label: '#Personal', color: '#2db7f5' },
    { value: 'urgent', label: '#Urgent', color: '#87d068' },
    { value: 'long-term', label: '#Long-term', color: '#108ee9' },
  ];

  // Fetch tasks from API
  useEffect(() => {
    fetch('/api/tasks')
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  // Save tasks to API
  useEffect(() => {
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks),
    }).catch(error => console.error('Error saving tasks:', error));
  }, [tasks]);

  // Add a new task
  const addTask = () => {
    if (newTask.trim() !== '') {
      const newTaskObj = {
        id: Date.now(),
        text: newTask,
        completed: false,
        dueDate: null,
        priority: 'medium',
        category: '',
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
    }
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Toggle task completion status
  const toggleComplete = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    // Show confetti when a task is completed
    if (updatedTasks.find((task) => task.id === taskId).completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // Hide confetti after 3 seconds
    }
  };

  // Edit a task
  const editTask = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  // Handle task editing form submission
  const handleEditSubmit = (values) => {
    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id ? { ...task, ...values } : task
      )
    );
    setIsModalVisible(false);
    setEditingTask(null);
  };

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'completed') return task.completed;
        if (filter === 'active') return !task.completed;
        return true;
      })
      .filter((task) =>
        task.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [tasks, filter, searchTerm]);

  return (
    <Layout className={styles.layout}>
      <Layout>
        <Content className={styles.content}>
          <div className={styles.todoContainer}>
            <h1 className={styles.title}>Journal Todo List</h1>
            <div className={styles.addTaskContainer}>
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onPressEnter={addTask}
                placeholder="Add a new task"
              />
              <Button type="primary" onClick={addTask} icon={<PlusOutlined />}>
                Add Task
              </Button>
            </div>
            <div className={styles.filterContainer}>
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={(value) => setFilter(value)}
              >
                <Option value="all">All</Option>
                <Option value="active">Active</Option>
                <Option value="completed">Completed</Option>
              </Select>
              <Input
                placeholder="Search tasks"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <List
              className={styles.taskList}
              itemLayout="horizontal"
              dataSource={filteredTasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Button icon={<EditOutlined />} onClick={() => editTask(task)} />,
                    <Button icon={<DeleteOutlined />} onClick={() => deleteTask(task.id)} />,
                  ]}
                >
                  <Checkbox checked={task.completed} onChange={() => toggleComplete(task.id)}>
                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.text}
                    </span>
                  </Checkbox>
                  {task.dueDate && <Tag color="blue">{moment(task.dueDate).format('YYYY-MM-DD')}</Tag>}
                  <Tag color={hashtags.find(ht => ht.value === task.category)?.color || 'default'}>
                    {hashtags.find(ht => ht.value === task.category)?.label || 'No Category'}
                  </Tag>
                </List.Item>
              )}
            />
            <Modal
              title="Edit Task"
              visible={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              footer={null}
            >
              <Form
                initialValues={{
                  text: editingTask?.text || '',
                  dueDate: editingTask?.dueDate ? moment(editingTask.dueDate) : null,
                  priority: editingTask?.priority || 'medium',
                  category: editingTask?.category || '',
                }}
                onFinish={handleEditSubmit}
              >
                <Form.Item name="text" label="Task" rules={[{ required: true }]}>
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item name="dueDate" label="Due Date">
                  <DatePicker />
                </Form.Item>
                <Form.Item name="priority" label="Priority">
                  <Select>
                    <Option value="high">High</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="low">Low</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="category" label="Category">
                  <Select>
                    {hashtags.map(ht => (
                      <Option key={ht.value} value={ht.value}>
                        <span style={{ color: ht.color }}>{ht.label}</span>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
          {showConfetti && <Confetti />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default TodoList;
