const express= require('express')
const taskRouter= express.Router();
const isAuth= require('../middleware/isAuth')

const taskController= require('../controllers/taskController');

taskRouter.get('/', isAuth,taskController.getTasks);

taskRouter.post('/', isAuth, taskController.postTask);

taskRouter.delete('/:taskId', isAuth, taskController.deleteTask);


taskRouter.put('/:taskId', isAuth, taskController.updateTask)

module.exports= taskRouter; 