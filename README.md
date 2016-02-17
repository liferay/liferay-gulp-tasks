# Liferay Gulp Tasks

Gulp tasks to be shared between Liferay projects.

## Usage
This is a collection of tasks to be used by Liferay projects. To use them, just install this through [npm](https://www.npmjs.com/package/liferay-gulp-tasks) and register the tasks on your gulpfile like this:

```js

var liferayGulpTasks = require('liferay-gulp-tasks');
liferayGulpTasks.registerTasks(options);
```

After calling the `registerTasks` function, several tasks will then be available to run on gulp. As you can see, `registerTasks` receives an optional object to customize these tasks.
