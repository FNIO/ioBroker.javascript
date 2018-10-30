import PropTypes from 'prop-types';

export const PROGRESS = {
    CONNECTING: 0,
    CONNECTED: 1,
    OBJECTS_LOADED: 2,
    READY: 3
};

class Connection {
    constructor(props) {
        props = props || {};
        this.props = props;
        this.socket = window.io.connect(
            window.location.protocol + '//' + window.location.host.replace('3000', 8081),
            {query: 'ws=true'});
        this.states = {};
        this.objects = {};
        this.scripts = {
            list: [],
            hosts: [],
            groups: [],
            instances: []
        };
        this.acl = null;
        this.firstConnect = true;
        this.waitForRestart = false;
        this.systemLang = 'en';
        this.props.onProgress = this.props.onProgress || function () {};
        this.props.onError = this.props.onError || function (err) {console.error(err);};

        this.socket.on('connect', () => {
            if (this.firstConnect) {
                this.props.onProgress(PROGRESS.CONNECTED);
                this.firstConnect = false;
                this.socket.emit('getUserPermissions', (err, acl) => {
                    this.acl = acl;
                    // Read system configuration
                    this.socket.emit('getObject', 'system.config', (err, data) => {
                        this.systemConfig = data;
                        if (!err && this.systemConfig && this.systemConfig.common) {
                            this.systemLang = this.systemConfig.common.language;
                        } else {
                            this.systemLang = window.navigator.userLanguage || window.navigator.language;

                            if (this.systemLang !== 'en' && this.systemLang !== 'de' && this.systemLang !== 'ru') {
                                this.systemConfig.common.language = 'en';
                                this.systemLang = 'en';
                            }
                        }
                        this.props.onLanguage && this.props.onLanguage(this.systemLang);

                        this.getObjects(() => {
                            this.props.onProgress(PROGRESS.READY);
                            this.props.onReady && this.props.onReady(this.objects, this.scripts);
                        });
                    });
                });
            } else {
                this.props.onProgress(PROGRESS.READY);
            }

            this.subscribeLog(true);

            if (this.waitForRestart) {
                window.location.reload();
            }
        });
        this.socket.on('disconnect', () => this.props.onProgress(PROGRESS.CONNECTING));
        this.socket.on('reconnect', () => {
            this.props.onProgress(PROGRESS.READY);
            if (this.waitForRestart) {
                window.location.reload();
            }
        });
        this.socket.on('reauthenticate', () => window.location.reload());
        this.socket.on('log', message => this.props.onLog && this.props.onLog(message));

        this.socket.on('permissionError', err =>
            this.props.onError && this.props.onError({message: 'no permission', operation: err.operation, type: err.type, id: (err.id || '')}));

        this.socket.on('objectChange', (id, obj) => setTimeout(() => this.objectChange(id, obj), 0));
        this.socket.on('stateChange', (id, state) => setTimeout(() => this.stateChange(id, state), 0))
    }

    objectChange(id, obj) {
        // update main.objects cache
        let changed = false;
        if (obj) {
            if (obj._rev && this.objects[id]) {
                this.objects[id]._rev = obj._rev;
            }

            if (!this.objects[id] || JSON.stringify(this.objects[id]) !== JSON.stringify(obj)) {
                this.objects[id] = obj;
                changed = true;
                let pos;
                if (obj.type === 'instance') {
                    pos = this.scripts.instances.indexOf(id);
                    if (pos === -1) this.scripts.instances.push(id);
                } else
                if (obj.type === 'script') {
                    pos = this.scripts.list.indexOf(id);
                    if (pos === -1) this.scripts.list.push(id);
                } else
                if (id.match(/^script\.js\./) && obj.type === 'channel') {
                    pos = this.scripts.groups.indexOf(id);
                    if (pos === -1) this.scripts.groups.push(id);
                }
            }
        } else if (this.objects[id]) {
            const oldObj = {_id: id, type: this.objects[id].type};
            delete this.objects[id];
            let pos;
            if (oldObj.type === 'instance') {
                pos = this.scripts.instances.indexOf(id);
                if (pos !== -1) this.scripts.instances.splice(pos, 1);
            } else
            if (oldObj.type === 'script') {
                pos = this.scripts.list.indexOf(id);
                if (pos !== -1) this.scripts.list.splice(pos, 1);
            } else
            if (id.match(/^script\.js\./) && oldObj.type === 'channel') {
                pos = this.scripts.groups.indexOf(id);
                if (pos !== -1) this.scripts.groups.splice(pos, 1);
            }
            changed = true;
        }

        if (changed) {
            this.props.onObjectChange && this.props.onObjectChange(this.objects, this.scripts);
        }
    }

    stateChange(id, state) {
        id = id ? id.replace(/[\s'"]/g, '_') : '';

    }

    getStates(cb) {
        this.socket.emit('getStates', (err, res) => {
            this.states = res;
            this.props.onProgress(PROGRESS.STATES_LOADED);
            cb && setTimeout(() => cb(), 0);
        });
    }

    getObjects(cb) {
        this.socket.emit('getAllObjects', (err, res) => {
            setTimeout(() => {
                let obj;
                this.objects = res;
                for (const id in this.objects) {
                    if (!this.objects.hasOwnProperty(id) || id.slice(0, 7) === '_design') continue;

                    obj = res[id];
                    if (obj.type === 'instance' && id.startsWith('system.adapter.javascript.')) this.scripts.instances.push(parseInt(id.split('.').pop()));
                    if (obj.type === 'script')   this.scripts.list.push(id);
                    if (obj.type === 'channel' && id.match(/^script\.js\./)) this.scripts.groups.push(id);
                    if (obj.type === 'host')     this.scripts.hosts.push(id);
                }
                this.props.onProgress(PROGRESS.OBJECTS_LOADED);

                cb && cb();
            }, 0);
        });
    }

    subscribeLog(isEnable) {
        if (isEnable && !this.subscribed) {
            this.subscribed = true;
            console.log('Subscribe logs');
            this.socket.emit('subscribeObjects', 'script.*');
            this.socket.emit('subscribeObjects', 'system.adapter.javascript.*');
            this.socket.emit('requireLog', true);
        } else if (!isEnable && this.subscribed) {
            this.subscribed = false;
            console.log('Unsubscribe logs');
            this.socket.emit('unsubscribeObjects', 'script.*');
            this.socket.emit('unsubscribeObjects', 'system.adapter.javascript.*');
            this.socket.emit('requireLog', false);
        }
    }

    setObject(id, obj) {
        return new Promise((resolve, reject) => {
            this.socket.emit('setObject', id, obj, err => {
                err ? reject(err) : resolve();
            });
        });
    }

    updateScript(oldId, newId, newCommon) {
        return new Promise((resolve, reject) => {
            this.socket.emit('getObject', oldId, (err, _obj) => {
                setTimeout(() => {
                    const obj = {common: {}};

                    if (newCommon.engine  !== undefined) obj.common.engine  = newCommon.engine;
                    if (newCommon.enabled !== undefined) obj.common.enabled = newCommon.enabled;
                    if (newCommon.source  !== undefined) obj.common.source  = newCommon.source;
                    if (newCommon.debug   !== undefined) obj.common.debug   = newCommon.debug;
                    if (newCommon.verbose !== undefined) obj.common.verbose = newCommon.verbose;

                    if (oldId === newId && _obj && _obj.common && newCommon.name === _obj.common.name) {
                        if (!newCommon.engineType || newCommon.engineType !== _obj.common.engineType) {
                            if (newCommon.engineType !== undefined) obj.common.engineType  = newCommon.engineType || 'Javascript/js';

                            this.socket.emit('extendObject', oldId, obj, err => err ? reject(err) : resolve());
                        } else {
                            this.socket.emit('extendObject', oldId, obj, err => err ? reject(err) : resolve());
                        }
                    } else {
                        // let prefix;

                        // let parts = _obj.common.engineType.split('/');

                        // prefix = 'script.' + (parts[1] || parts[0]) + '.';

                        if (_obj && _obj.common) {
                            _obj.common.engineType = newCommon.engineType || _obj.common.engineType || 'Javascript/js';
                            this.socket.emit('delObject', oldId, err => {
                                if (err) {
                                    reject(err);
                                } else {
                                    if (obj.common.engine  !== undefined) _obj.common.engine  = obj.common.engine;
                                    if (obj.common.enabled !== undefined) _obj.common.enabled = obj.common.enabled;
                                    if (obj.common.source  !== undefined) _obj.common.source  = obj.common.source;
                                    if (obj.common.name    !== undefined) _obj.common.name    = obj.common.name;
                                    if (obj.common.debug   !== undefined) _obj.common.debug   = obj.common.debug;
                                    if (obj.common.verbose !== undefined) _obj.common.verbose = obj.common.verbose;

                                    delete _obj._rev;

                                    // Name must always exist
                                    _obj.common.name = newCommon.name;

                                    _obj._id = newId; // prefix + newCommon.name.replace(/[\s"']/g, '_');

                                    this.socket.emit('setObject', newId, _obj, err => err ? reject(err) : resolve());
                                }
                            });
                            return;
                        } else {
                            _obj = obj;
                        }

                        // Name must always exist
                        _obj.common.name = newCommon.name;

                        _obj._id = newId; // prefix + newCommon.name.replace(/[\s"']/g, '_');

                        this.socket.emit('setObject', newId, _obj, err => err ? reject(err) : resolve());
                    }
                }, 0);
            });
        });
    }

    _deleteGroup(id, originalGroup, confirmed, deleted) {
        if (confirmed.indexOf(id) === -1) {
            confirmed.push(id);
        }

        return new Promise((resolve, reject) => {
            // find all elements
            for (let l = 0; l < this.scripts.list.length; l++) {
                if (this.scripts.list[l].substring(0, id.length + 1) === id + '.' &&
                    (!deleted || deleted.indexOf(this.scripts.list[l]) === -1)) {
                    return this.deleteId(this.scripts.list[l], id, confirmed, deleted);
                }
            }

            for (let g = 0; g < this.scripts.groups.length; g++) {
                if (this.scripts.groups[g].substring(0, id.length + 1) === id + '.') {
                    return this.deleteId(this.scripts.groups[g], id, confirmed, deleted);
                }
            }

            this.socket.emit('delObject', id, err => {
                if (err) {
                    reject(err);
                } else if (originalGroup !== id) {
                    return this.deleteId(originalGroup, null, confirmed, deleted);
                } else {
                    // finish
                    resolve();
                }
            });
        });
    }

    deleteId(id, originalGroup, confirmed, deleted) {
        originalGroup = originalGroup || id;
        confirmed     = confirmed     || [];
        deleted       = deleted       || [];

        return new Promise((resolve, reject) => {
            if (this.objects[id] && this.objects[id].type === 'script') {
                if (this.props.onConfirmDelete) {
                    this.props.onConfirmDelete(false, this.objects[id].common.name, result => {
                        if (result) {
                            this.socket.emit('delObject', id, err => {
                                if (err) {
                                    reject(err);
                                } else {
                                    deleted.push(id);
                                    return this.deleteId(originalGroup, null, confirmed, deleted);
                                }
                            });
                        } else {
                            // Do nothing
                            reject('canceled');
                        }
                    });
                } else {
                    this.socket.emit('delObject', id, err => {
                        if (err) {
                            reject(err);
                        } else {
                            deleted.push(id);
                            return this.deleteId(originalGroup, null, confirmed, deleted);
                        }
                    });
                }
            } else {
                let name = id;
                if (confirmed.indexOf(id) === -1) {
                    if (this.objects[id] && this.objects[id].common && this.objects[id].common.name) {
                        name = this.objects[id].common.name;
                    }

                    if (this.props.onConfirmDelete) {
                        this.props.onConfirmDelete(true, name, result => {
                            if (result) {
                                return this._deleteGroup(id, originalGroup, confirmed, deleted);
                            } else {
                                reject('canceled');
                            }
                        });
                    } else {
                        return this._deleteGroup(id, originalGroup, confirmed, deleted);
                    }
                } else {
                    return this._deleteGroup(id, originalGroup, confirmed, deleted);
                }
            }
        });
    }

    renameGroup(id, newId, newName, _list) {
        return new Promise((resolve, reject) => {
            if (!_list) {
                _list = [];

                // collect all elements to rename
                // find all elements
                for (let l = 0; l < this.scripts.list.length; l++) {
                    if (this.scripts.list[l].substring(0, id.length + 1) === id + '.') {
                        _list.push(this.scripts.list[l]);
                    }
                }
                for (let g = 0; g < this.scripts.groups.length; g++) {
                    if (this.scripts.groups[g].substring(0, id.length + 1) === id + '.') {
                        _list.push(this.scripts.list[g]);
                    }
                }

                this.socket.emit('getObject', id, (err, obj) => {
                    if (err) {
                        reject(err);
                    } else {
                        obj = obj || {common: {}};
                        obj.common.name = newName;
                        obj._id = newId;

                        this.socket.emit('delObject', id, err => {
                            if (err) {
                                reject(err);
                            } else {
                                this.socket.emit('setObject', newId, obj, err => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        return this.renameGroup(id, newId, newName, _list);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                if (_list.length) {
                    let nId = _list.pop();

                    this.socket.emit('getObject', nId, (err, obj) => {
                        if (err) {
                            reject(err);
                        } else {
                            this.socket.emit('delObject', nId, err => {
                                if (err) {
                                    reject(err);
                                } else {
                                    nId = newId + nId.substring(id.length);
                                    this.socket.emit('setObject', nId, obj, err => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            return this.renameGroup(id, newId, newName, _list);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    resolve();
                }
            }
        });
    }
}

Connection.Connection = {
    onLog: PropTypes.func,
    onReady: PropTypes.func,
    onProgress: PropTypes.func,
};

export default Connection;