(function () {
    'use strict';

    /**
     * @name app.utils
     */

    /**
     * @param $q
     * @return {app.utils}
     */
    const factory = function ($q) {

        class Moment {

            constructor(date) {
                /**
                 * @type {Date}
                 * @private
                 */
                this._date = date;

                this.add = {
                    /**
                     * @param {number} count
                     * @return {Moment}
                     */
                    second: (count) => {
                        const [y, m, d, h, mm, s, ms] = this._getParts();
                        this._date = new Date(y, m, d, h, mm, s + count, ms);
                        return this;
                    },
                    /**
                     * @param {number} count
                     * @return {Moment}
                     */
                    minute: (count) => {
                        const [y, m, d, h, mm, s, ms] = this._getParts();
                        this._date = new Date(y, m, d, h, mm + count, s, ms);
                        return this;
                    },
                    /**
                     * @param {number} count
                     * @return {Moment}
                     */
                    hour: (count) => {
                        const [y, m, d, h, mm, s, ms] = this._getParts();
                        this._date = new Date(y, m, d, h + count, mm, s, ms);
                        return this;
                    },
                    /**
                     * @param {number} count
                     * @return {Moment}
                     */
                    day: (count) => {
                        const [y, m, d, h, mm, s, ms] = this._getParts();
                        this._date = new Date(y, m, d + count, h, mm, s, ms);
                        return this;
                    },
                    /**
                     * @param {number} count
                     * @return {Moment}
                     */
                    month: (count) => {
                        const [y, m, d, h, mm, s, ms] = this._getParts();
                        this._date = new Date(y, m + count, d, h, mm, s, ms);
                        return this;
                    },
                    /**
                     * @param {number} count
                     * @return {Moment}
                     */
                    year: (count) => {
                        const [y, m, d, h, mm, s, ms] = this._getParts();
                        this._date = new Date(y + count, m, d, h, mm, s, ms);
                        return this;
                    }
                };

                this.startOf = {
                    second: () => {
                        const [y, m, d, h, mm, s] = this._getParts();
                        this._date = new Date(y, m, d, h, mm, s);
                        return this;
                    },

                    minute: () => {
                        const [y, m, d, h, mm, s] = this._getParts();
                        this._date = new Date(y, m, d, h, mm);
                        return this;
                    },

                    hour: () => {
                        const [y, m, d, h] = this._getParts();
                        this._date = new Date(y, m, d, h);
                        return this;
                    },

                    day: () => {
                        const [y, m, d] = this._getParts();
                        this._date = new Date(y, m, d);
                        return this;
                    },

                    month: () => {
                        this._date = new Date(this._date.getFullYear(), this._date.getMonth());
                        return this;
                    },

                    year: () => {
                        this._date = new Date(this._date.getFullYear());
                        return this;
                    }
                };
            }

            /**
             * @param {string} pattern
             * @returns {string}
             */
            format(pattern) {
                return tsUtils.date(pattern)(this.date);
            }

            /**
             * @return {Moment}
             */
            clone() {
                return new Moment(this._date);
            }

            /**
             * @return {number}
             */
            valueOf() {
                return this._date.valueOf();
            }

            /**
             * @return {string}
             */
            toString() {
                return this._date.toString();
            }

            /**
             * @return {Date}
             */
            getDate() {
                return this._date;
            }

            /**
             * @returns {number[]}
             * @private
             */
            _getParts() {
                return [
                    this._date.getFullYear(),
                    this._date.getMonth(),
                    this._date.getDate(),
                    this._date.getHours(),
                    this._date.getMinutes(),
                    this._date.getSeconds(),
                    this._date.getMilliseconds()
                ];
            }

        }

        const utils = {

            /**
             * @name app.utils#when
             * @param {*} data
             * @return {Promise}
             */
            when(data) {
                if (data.then && typeof data.then === 'function') {
                    const defer = $q.defer();
                    data.then(defer.resolve, defer.reject);
                    return defer.promise;
                } else {
                    return $q.when(data);
                }
            },

            /**
             * @name app.utils#whenAll
             * @param {Array<Promise>} promises
             * @return {Promise}
             */
            whenAll(promises) {
                return utils.when(Promise.all(promises));
            },

            /**
             * @name app.utils#isEqual
             * @param a
             * @param b
             * @return {boolean}
             */
            isEqual(a, b) {
                const typeA = typeof a;
                const typeB = typeof b;

                if (typeA !== typeB) {
                    return false;
                }

                if (typeA !== 'object') {
                    return a === b;
                }

                const pathsA = tsUtils.getPaths(a);
                const pathsB = tsUtils.getPaths(b);

                return pathsA.length === pathsB.length && pathsA.every((path, index) => {
                    return tsUtils.get(a, path) === tsUtils.get(b, path) && (String(path) === String(pathsB[index]));
                });
            },

            /**
             * @name app.utils#bind
             * @param {object} target
             * @param {Array<string>|string} [keys]
             * @return {object}
             */
            bind(target, keys) {
                if (keys == null) {
                    keys = Object.keys(target);
                    if (keys.length === 0) {
                        const proto = Object.getPrototypeOf(target);
                        keys = Object.getOwnPropertyNames(proto)
                            .filter((method) => {
                                return method.charAt(0) !== '_' && method !== 'constructor';
                            });
                    } else {
                        keys = keys.filter((key) => typeof target[key] === 'function');
                    }
                } else {
                    keys = Array.isArray(keys) ? keys : [keys];
                }

                keys.forEach((key) => {
                    target[key] = target[key].bind(target);
                });
                return target;
            },

            /**
             * @name app.utils#resolve
             * @param {{then: Function}} promiseLike
             * @return {Promise}
             */
            resolve(promiseLike) {
                const getCallback = (state, resolve) => {
                    return (data) => resolve({ state, data });
                };
                return $q((resolve) => {
                    promiseLike.then(getCallback(true, resolve), getCallback(false, resolve));
                });
            },

            /**
             * @name app.utils#moment
             * @param {Date | number} [date]
             * @return {Moment}
             */
            moment(date) {
                return new Moment(date && new Date(date) || new Date());
            },

            /**
             * @name app.utils#loadImage
             * @param {string} url
             * @return {Promise}
             */
            loadImage(url) {
                return $q((resolve, reject) => {
                    const img = new Image(url);
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = url;
                });
            },

            /**
             * @name app.utils#getNiceNumber
             * @param num
             * @param precision
             * @returns {string}
             */
            getNiceNumber(num, precision) {
                return utils.parseNiceNumber(num)
                    .toLocaleString(i18next.language, {
                        minimumFractionDigits: precision
                    });
            },

            /**
             * @name app.utils#parseNiceNumber
             * @param data
             * @returns {number}
             */
            parseNiceNumber(data) {
                return Number(String(data)
                    .replace(',', '.')
                    .replace(/\s/g, '')) || 0;
            },

            /**
             * @name app.utils#toArray
             * @param {*} some
             * @return {[*]}
             */
            toArray(some) {
                return Array.isArray(some) ? some : [some];
            }
        };

        return utils;
    };

    factory.$inject = ['$q', '$timeout'];

    angular.module('app.utils')
        .factory('utils', factory);
})();
