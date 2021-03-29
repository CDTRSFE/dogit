const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

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

    // 获取某个前缀的所有tag
    allTags(tagPrefix) {
        const command = `git tag -l "${tagPrefix}*" --sort=-v:refname`;
        return new Promise(resolve => {
            exec(command, (error, stdout, stderr) => {
                const tags = (stdout || '').split('\n').filter(item => item);
                resolve(tags || [])
            });
        })
    },
    // 获取远程仓库的源
    allRemotes() {
        const command = `git remote`;
        return new Promise(resolve => {
            exec(command, (error, stdout, stderr) => {
                const origins = (stdout || '').split('\n').filter(item => item);
                resolve(origins || [])
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

    // 判断某个tag是否已经存在
    isTagExist(tag) {
        const command = `git tag -l "${tag}*" --sort=-v:refname`;
        const result = execSync(command);
        console.log('===', result);
        return false;
    },

    // 根据上次版本自动预测下次版本号
    guessNextTag(version) {
        if (!version) return '0.1.0';
        const matchs = version.match(/^([\d\.]+)(.+)?$/);
        if (!matchs) return '0.1.0'
        return `${matchs[1].replace(/\d+$/, (match) => parseInt(match) + 1)}${matchs[2] || ''}`
    },
    // 查询当前分支名
    getCurrentbranch(){
        const command = 'git symbolic-ref --short -q HEAD';
        return execSync(command);
    },
    // 获取当前分支与远程仓库的差异
    getBranchDifferent(branch,origin){
        const command = `git log --pretty=format:"%s" ${branch} ^${origin}/${branch}`
        console.log(command)
        return execSync(command).toString();
        
    }
}
