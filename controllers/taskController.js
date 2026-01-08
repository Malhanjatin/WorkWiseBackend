const Task = require("../models/taskModel");

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json(tasks);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "fetching task failed", err: err.message });
  }
};

exports.postTask = async (req, res, next) => {
  try {
    const { title, priority } = req.body;
    const newTask = new Task({
      title,
      priority,
      userId: req.userId,
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: "creating task failed", err: err.message });
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId: req.userId,
    });
    if (!task) {
      return res.status(404).json({ message: "task not found" });
    }
    return res.status(200).json({ message: "task deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "deleting task failed", err: err.message });
  }
};
exports.updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { title, completed, priority } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.userId },
      { completed, title, priority },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "task not found" });
    }
    return res.status(200).json({ message: "task updated successfully", task });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "updating task failed", err: err.message });
  }
};
