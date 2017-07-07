# 0.5.0

Chalk just updated to `v2`, which drops support for node `v0.12` and below.

In order to maintain compatibility, we need to specify which version of chalk to use by updating run-sequence to `v2.0.0`.

# 0.4.1

The default repositories ids have been changed to stay consistent with their new urls. Now, ids are:
    - liferay-public-releases
    - liferay-public-snapshots

Any `.m2/settings.xml` file keeping server information for this should be updated to reflect the new ids.

# 0.3.0

- The registerTasks method has now removed. Instead, the main export is a function that you call, and you must pass along your version of gulp as well.
```
	var gulp = require('liferay-gulp-tasks')(require('gulp'), options);
```

# 0.2.0

- The default repositories ids have been changed to stay consistent with their urls. Now, ids are:
    - liferay-releases-ce
    - liferay-snapshots-ce

Any `.m2/settings.xml` file keeping server information for this should be updated to reflect the new ids.
