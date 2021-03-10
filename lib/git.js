const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
    // 当前目录是否是git仓库的根目录
    isGitRoot() {
        return new Promise(resolve => {
            exec(`git rev-parse --is-inside-work-tree`, (error, stdout, stderr) => {
                resolve(!error);
            });
        })
    },

    // 同步远端仓库
    fetchRemote() {
        return new Promise(resolve => {
            exec(`git fetch`, (error, stdout, stderr) => {
                resolve(!error);
            });
        })
    },

    // 获取某个环境的最新tag
    latestEnvTag(tagPrefix) {
        const command = `git tag -l "${tagPrefix}*" --sort=-v:refname | head -n 1`;
        return new Promise(resolve => {
          exec(command, (error, stdout, stderr) => {
              resolve((stdout || '').replace(/[\r\n]/, ''));
          });
      })
    },

    // 根据上次版本自动预测下次版本号
    guessNextTag(version) {
        if (!version) return '0.1.0';
        const matchs = version.match(/^([\d\.]+)(.+)?$/);
        if (!matchs) return '0.1.0'
        return `${matchs[1].replace(/\d+$/, (match) => parseInt(match) + 1)}${matchs[2] || ''}`
    }
}