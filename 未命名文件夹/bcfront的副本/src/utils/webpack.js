module.exports = {
  async preProcess() {
    const path = require('path');
    const fs = require('fs');
    const gitRevision = require(path.resolve('./node_modules/git-revision-webpack-plugin'));
    const revision = new gitRevision();
    const info = require(path.resolve('./node_modules/git-describe')).gitDescribeSync();
    const shell = require(path.resolve('./node_modules/shell-exec'));
    const env = {};

    env.VUE_APP_GIT_VERSION = JSON.stringify(revision.version());
    env.VUE_APP_GIT_COMMITHASH = JSON.stringify(revision.commithash());
    env.VUE_APP_GIT_BRANCH = JSON.stringify(revision.branch());
    env.VUE_APP_GIT_TAG = JSON.stringify(info.tag);

    // 產生版本號檔案static/

    await shell(`git log HEAD`)
      .then(rs => {
        env.VUE_APP_GIT_COMMITDETAIL = rs.stdout.replace(/[<].*[>]/g, '').replace(/\n\ncommit/g, '\n\n;commit');
      })
      .catch(ex => console.log(`failed: ${ex}`));

    const { VUE_APP_GIT_VERSION, VUE_APP_GIT_COMMITHASH, VUE_APP_GIT_BRANCH, VUE_APP_GIT_TAG, VUE_APP_GIT_COMMITDETAIL } = env;
    const details = VUE_APP_GIT_COMMITDETAIL.split(';').filter(desc => !/Merge/gi.test(desc));
    await fs.writeFileSync(
      path.resolve('./public/version.json'),
      JSON.stringify(
        {
          DEPLOY_TIME: new Date(),
          GIT_VERSION: VUE_APP_GIT_VERSION,
          GIT_COMMITHASH: VUE_APP_GIT_COMMITHASH,
          GIT_BRANCH: VUE_APP_GIT_BRANCH,
          GIT_TAG: VUE_APP_GIT_TAG,
          GIT_COMMITDETAIL: details,
        },
        null,
        2,
      ),
      err => {
        if (err) {
          console.log(err);
        } else {
          args[0]['process.env'].packageVersionSuccess = true;
          // console.log('File written successfully\n');
          // console.log('The written has the following contents:');
          // console.log(fs.readFileSync(path.resolve('./public/version.json'), 'utf8'));
        }
      },
    );
    return env;
  },
};
