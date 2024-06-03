/*! Buefy v0.9.23 | MIT License | github.com/buefy/buefy */
import { Fragment, Comment, Text, Static, openBlock, createElementBlock, normalizeClass, createBlock, resolveDynamicComponent, resolveComponent, mergeProps, createCommentVNode, toDisplayString, createVNode, withKeys, withModifiers, Transition, withCtx, withDirectives, createElementVNode, normalizeStyle, renderSlot, renderList, vShow, normalizeProps, guardReactiveProps, vModelCheckbox, h, resolveDirective, createTextVNode, createSlots, vModelSelect, toHandlers, vModelDynamic, createApp, vModelRadio, toHandlerKey } from '/scripts/vue.esm-browser.js';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function ownKeys$9(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$9(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$9(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$9(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * +/- function to native math sign
 */
function signPoly(value) {
  if (value < 0) return -1;
  return value > 0 ? 1 : 0;
}
var sign = Math.sign || signPoly;

/**
 * Checks if the flag is set
 * @param val
 * @param flag
 * @returns {boolean}
 */
function hasFlag(val, flag) {
  return (val & flag) === flag;
}

/**
 * Native modulo bug with negative numbers
 * @param n
 * @param mod
 * @returns {number}
 */
function mod(n, mod) {
  return (n % mod + mod) % mod;
}

/**
 * Asserts a value is beetween min and max
 * @param val
 * @param min
 * @param max
 * @returns {number}
 */
function bound(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Get value of an object property/path even if it's nested
 */
function getValueByPath(obj, path) {
  return path.split('.').reduce(function (o, i) {
    return o ? o[i] : null;
  }, obj);
}

/**
 * Extension of indexOf method by equality function if specified
 */
function indexOf(array, obj, fn) {
  if (!array) return -1;
  if (!fn || typeof fn !== 'function') return array.indexOf(obj);
  for (var i = 0; i < array.length; i++) {
    if (fn(array[i], obj)) {
      return i;
    }
  }
  return -1;
}

/**
 * Merge function to replace Object.assign with deep merging possibility
 */
var isObject = function isObject(item) {
  return _typeof(item) === 'object' && !Array.isArray(item);
};
var mergeFn = function mergeFn(target, source) {
  var deep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (deep || !Object.assign) {
    var isDeep = function isDeep(prop) {
      return isObject(source[prop]) && target !== null && Object.prototype.hasOwnProperty.call(target, prop) && isObject(target[prop]);
    };
    var replaced = Object.getOwnPropertyNames(source).map(function (prop) {
      return _defineProperty({}, prop, isDeep(prop) ? mergeFn(target[prop], source[prop], deep) : source[prop]);
    }).reduce(function (a, b) {
      return _objectSpread$9(_objectSpread$9({}, a), b);
    }, {});
    return _objectSpread$9(_objectSpread$9({}, target), replaced);
  } else {
    return Object.assign(target, source);
  }
};
var merge = mergeFn;

/**
 * Mobile detection
 * https://www.abeautifulsite.net/detecting-mobile-devices-with-javascript
 */
var isMobile = {
  Android: function Android() {
    return typeof window !== 'undefined' && window.navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function BlackBerry() {
    return typeof window !== 'undefined' && window.navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function iOS() {
    return typeof window !== 'undefined' && (window.navigator.userAgent.match(/iPhone|iPad|iPod/i) || window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  },
  Opera: function Opera() {
    return typeof window !== 'undefined' && window.navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function Windows() {
    return typeof window !== 'undefined' && window.navigator.userAgent.match(/IEMobile/i);
  },
  any: function any() {
    return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
  }
};
function removeElement(el) {
  if (typeof el.remove !== 'undefined') {
    el.remove();
  } else if (typeof el.parentNode !== 'undefined' && el.parentNode !== null) {
    el.parentNode.removeChild(el);
  }
}
function createAbsoluteElement(el) {
  var root = document.createElement('div');
  root.style.position = 'absolute';
  root.style.left = '0px';
  root.style.top = '0px';
  root.style.width = '100%';
  var wrapper = document.createElement('div');
  root.appendChild(wrapper);
  wrapper.appendChild(el);
  document.body.appendChild(root);
  return root;
}
function isVueComponent(c) {
  return c && c._isVue;
}

/**
 * Escape regex characters
 * http://stackoverflow.com/a/6969486
 */
function escapeRegExpChars(value) {
  if (!value) return value;

  // eslint-disable-next-line
  return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
/**
 * Remove accents/diacritics in a string in JavaScript
 * https://stackoverflow.com/a/37511463
 */
function removeDiacriticsFromString(value) {
  if (!value) return value;
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function multiColumnSort(inputArray, sortingPriority) {
  // clone it to prevent the any watchers from triggering every sorting iteration
  var array = JSON.parse(JSON.stringify(inputArray));
  var fieldSorter = function fieldSorter(fields) {
    return function (a, b) {
      return fields.map(function (o) {
        var dir = 1;
        if (o[0] === '-') {
          dir = -1;
          o = o.substring(1);
        }
        var aValue = getValueByPath(a, o);
        var bValue = getValueByPath(b, o);
        return aValue > bValue ? dir : aValue < bValue ? -dir : 0;
      }).reduce(function (p, n) {
        return p || n;
      }, 0);
    };
  };
  return array.sort(fieldSorter(sortingPriority));
}
function createNewEvent(eventName) {
  var event;
  if (typeof Event === 'function') {
    event = new Event(eventName);
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventName, true, true);
  }
  return event;
}
function toCssWidth(width) {
  return width === undefined ? null : isNaN(width) ? width : width + 'px';
}

/**
 * Return month names according to a specified locale
 * @param  {String} locale A bcp47 localerouter. undefined will use the user browser locale
 * @param  {String} format long (ex. March), short (ex. Mar) or narrow (M)
 * @return {Array<String>} An array of month names
 */
function getMonthNames() {
  var locale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
  var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'long';
  var dates = [];
  for (var i = 0; i < 12; i++) {
    dates.push(new Date(2000, i, 15));
  }
  var dtf = new Intl.DateTimeFormat(locale, {
    month: format
  });
  return dates.map(function (d) {
    return dtf.format(d);
  });
}

/**
 * Return weekday names according to a specified locale
 * @param  {String} locale A bcp47 localerouter. undefined will use the user browser locale
 * @param  {String} format long (ex. Thursday), short (ex. Thu) or narrow (T)
 * @return {Array<String>} An array of weekday names
 */
function getWeekdayNames() {
  var locale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
  var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'narrow';
  var dates = [];
  for (var i = 0; i < 7; i++) {
    var dt = new Date(2000, 0, i + 1);
    dates[dt.getDay()] = dt;
  }
  var dtf = new Intl.DateTimeFormat(locale, {
    weekday: format
  });
  return dates.map(function (d) {
    return dtf.format(d);
  });
}

/**
 * Accept a regex with group names and return an object
 * ex. matchWithGroups(/((?!=<year>)\d+)\/((?!=<month>)\d+)\/((?!=<day>)\d+)/, '2000/12/25')
 * will return { year: 2000, month: 12, day: 25 }
 * @param  {String} includes injections of (?!={groupname}) for each group
 * @param  {String} the string to run regex
 * @return {Object} an object with a property for each group having the group's match as the value
 */
function matchWithGroups(pattern, str) {
  var matches = str.match(pattern);
  return pattern
  // get the pattern as a string
  .toString()
  // suss out the groups
  .match(/<(.+?)>/g)
  // remove the braces
  .map(function (group) {
    var groupMatches = group.match(/<(.+)>/);
    if (!groupMatches || groupMatches.length <= 0) {
      return null;
    }
    return group.match(/<(.+)>/)[1];
  })
  // create an object with a property for each group having the group's match as the value
  .reduce(function (acc, curr, index, arr) {
    if (matches && matches.length > index) {
      acc[curr] = matches[index + 1];
    } else {
      acc[curr] = null;
    }
    return acc;
  }, {});
}

/**
 * Based on
 * https://github.com/fregante/supports-webp
 */
function isWebpSupported() {
  return new Promise(function (resolve) {
    var image = new Image();
    image.onerror = function () {
      return resolve(false);
    };
    image.onload = function () {
      return resolve(image.width === 1);
    };
    image.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  }).catch(function () {
    return false;
  });
}
function isCustomElement(vm) {
  return 'shadowRoot' in vm.$root.$options;
}
var isDefined = function isDefined(d) {
  return d !== undefined;
};

/**
 * Checks if a value is null or undefined.
 * Based on
 * https://github.com/lodash/lodash/blob/master/isNil.js
 */
var isNil = function isNil(value) {
  return value === null || value === undefined;
};
function isFragment(vnode) {
  return vnode.type === Fragment;
}

// TODO: replacement of vnode.tag test
function isTag(vnode) {
  return vnode.type !== Comment && vnode.type !== Text && vnode.type !== Static;
}

// TODO: too much dependence of Vue's internal structure?
function getComponentFromVNode(vnode) {
  if (!vnode) {
    return undefined;
  }
  var component = vnode.component;
  if (!component) {
    return undefined;
  }
  return component.expose ? component.expose : component.proxy;
}

var config = {
  defaultContainerElement: null,
  defaultIconPack: 'mdi',
  defaultIconComponent: null,
  defaultIconPrev: 'chevron-left',
  defaultIconNext: 'chevron-right',
  defaultLocale: undefined,
  defaultDialogConfirmText: null,
  defaultDialogCancelText: null,
  defaultSnackbarDuration: 3500,
  defaultSnackbarPosition: null,
  defaultToastDuration: 2000,
  defaultToastPosition: null,
  defaultNotificationDuration: 2000,
  defaultNotificationPosition: null,
  defaultTooltipType: 'is-primary',
  defaultTooltipDelay: null,
  defaultTooltipCloseDelay: null,
  defaultSidebarDelay: null,
  defaultInputAutocomplete: 'on',
  defaultDateFormatter: null,
  defaultDateParser: null,
  defaultDateCreator: null,
  defaultTimeCreator: null,
  defaultDayNames: null,
  defaultMonthNames: null,
  defaultFirstDayOfWeek: null,
  defaultUnselectableDaysOfWeek: null,
  defaultTimeFormatter: null,
  defaultTimeParser: null,
  defaultModalCanCancel: ['escape', 'x', 'outside', 'button'],
  defaultModalScroll: null,
  defaultDatepickerMobileNative: true,
  defaultTimepickerMobileNative: true,
  defaultTimepickerMobileModal: true,
  defaultNoticeQueue: true,
  defaultInputHasCounter: true,
  defaultTaginputHasCounter: true,
  defaultUseHtml5Validation: true,
  defaultDropdownMobileModal: true,
  defaultFieldLabelPosition: null,
  defaultDatepickerYearsRange: [-100, 10],
  defaultDatepickerNearbyMonthDays: true,
  defaultDatepickerNearbySelectableMonthDays: false,
  defaultDatepickerShowWeekNumber: false,
  defaultDatepickerWeekNumberClickable: false,
  defaultDatepickerMobileModal: true,
  defaultTrapFocus: true,
  defaultAutoFocus: true,
  defaultButtonRounded: false,
  defaultSwitchRounded: true,
  defaultCarouselInterval: 3500,
  defaultTabsExpanded: false,
  defaultTabsAnimated: true,
  defaultTabsType: null,
  defaultStatusIcon: true,
  defaultProgrammaticPromise: false,
  defaultLinkTags: ['a', 'button', 'input', 'router-link', 'nuxt-link', 'n-link', 'RouterLink', 'NuxtLink', 'NLink'],
  defaultImageWebpFallback: null,
  defaultImageLazy: true,
  defaultImageResponsive: true,
  defaultImageRatio: null,
  defaultImageSrcsetFormatter: null,
  defaultBreadcrumbTag: 'a',
  defaultBreadcrumbAlign: 'is-left',
  defaultBreadcrumbSeparator: '',
  defaultBreadcrumbSize: 'is-medium',
  customIconPacks: null
};
var setOptions = function setOptions(options) {
  config = options;
};

var FormElementMixin = {
  props: {
    size: String,
    expanded: Boolean,
    loading: Boolean,
    rounded: Boolean,
    icon: String,
    iconPack: String,
    // Native options to use in HTML5 validation
    autocomplete: String,
    maxlength: [Number, String],
    useHtml5Validation: {
      type: Boolean,
      default: function _default() {
        return config.defaultUseHtml5Validation;
      }
    },
    validationMessage: String,
    locale: {
      type: [String, Array],
      default: function _default() {
        return config.defaultLocale;
      }
    },
    statusIcon: {
      type: Boolean,
      default: function _default() {
        return config.defaultStatusIcon;
      }
    }
  },
  emits: ['blur', 'focus'],
  data: function data() {
    return {
      isValid: true,
      isFocused: false,
      newIconPack: this.iconPack || config.defaultIconPack
    };
  },
  computed: {
    /**
     * Find parent Field, max 3 levels deep.
     */
    parentField: function parentField() {
      var parent = this.$parent;
      for (var i = 0; i < 3; i++) {
        if (parent && !parent.$data._isField) {
          parent = parent.$parent;
        }
      }
      return parent;
    },
    /**
     * Get the type prop from parent if it's a Field.
     */
    statusType: function statusType() {
      var _ref = this.parentField || {},
        newType = _ref.newType;
      if (!newType) return;
      if (typeof newType === 'string') {
        return newType;
      } else {
        for (var key in newType) {
          if (newType[key]) {
            return key;
          }
        }
      }
    },
    /**
     * Get the message prop from parent if it's a Field.
     */
    statusMessage: function statusMessage() {
      if (!this.parentField) return;
      return this.parentField.newMessage || this.parentField.$slots.message;
    },
    /**
     * Fix icon size for inputs, large was too big
     */
    iconSize: function iconSize() {
      switch (this.size) {
        case 'is-small':
          return this.size;
        case 'is-medium':
          return;
        case 'is-large':
          return this.newIconPack === 'mdi' ? 'is-medium' : '';
      }
    }
  },
  methods: {
    /**
     * Focus method that work dynamically depending on the component.
     */
    focus: function focus() {
      var el = this.getElement();
      if (el === undefined) return;
      this.$nextTick(function () {
        if (el) el.focus();
      });
    },
    onBlur: function onBlur($event) {
      this.isFocused = false;
      this.$emit('blur', $event);
      this.checkHtml5Validity();
    },
    onFocus: function onFocus($event) {
      this.isFocused = true;
      this.$emit('focus', $event);
    },
    getElement: function getElement() {
      var el = this.$refs[this.$data._elementRef];
      while (el != null && '$refs' in el) {
        el = el.$refs[el.$data._elementRef];
      }
      return el;
    },
    setInvalid: function setInvalid() {
      var type = 'is-danger';
      var message = this.validationMessage || this.getElement().validationMessage;
      this.setValidity(type, message);
    },
    setValidity: function setValidity(type, message) {
      var _this = this;
      this.$nextTick(function () {
        if (_this.parentField) {
          // Set type only if not defined
          if (!_this.parentField.type) {
            _this.parentField.newType = type;
          }
          // Set message only if not defined
          if (!_this.parentField.message) {
            _this.parentField.newMessage = message;
          }
        }
      });
    },
    /**
     * Check HTML5 validation, set isValid property.
     * If validation fail, send 'is-danger' type,
     * and error message to parent if it's a Field.
     */
    checkHtml5Validity: function checkHtml5Validity() {
      if (!this.useHtml5Validation) return;
      var el = this.getElement();
      if (el == null) return;
      if (!el.checkValidity()) {
        this.setInvalid();
        this.isValid = false;
      } else {
        this.setValidity(null, null);
        this.isValid = true;
      }
      return this.isValid;
    }
  }
};

var mdiIcons = {
  sizes: {
    default: 'mdi-24px',
    'is-small': null,
    'is-medium': 'mdi-36px',
    'is-large': 'mdi-48px'
  },
  iconPrefix: 'mdi-'
};
var faIcons = function faIcons() {
  var faIconPrefix = config && config.defaultIconComponent ? '' : 'fa-';
  return {
    sizes: {
      default: null,
      'is-small': null,
      'is-medium': faIconPrefix + 'lg',
      'is-large': faIconPrefix + '2x'
    },
    iconPrefix: faIconPrefix,
    internalIcons: {
      information: 'info-circle',
      alert: 'exclamation-triangle',
      'alert-circle': 'exclamation-circle',
      'chevron-right': 'angle-right',
      'chevron-left': 'angle-left',
      'chevron-down': 'angle-down',
      'eye-off': 'eye-slash',
      'menu-down': 'caret-down',
      'menu-up': 'caret-up',
      'close-circle': 'times-circle'
    }
  };
};
var getIcons = function getIcons() {
  var icons = {
    mdi: mdiIcons,
    fa: faIcons(),
    fas: faIcons(),
    far: faIcons(),
    fad: faIcons(),
    fab: faIcons(),
    fal: faIcons(),
    'fa-solid': faIcons(),
    'fa-regular': faIcons(),
    'fa-light': faIcons(),
    'fa-thin': faIcons(),
    'fa-duotone': faIcons(),
    'fa-brands': faIcons()
  };
  if (config && config.customIconPacks) {
    icons = merge(icons, config.customIconPacks, true);
  }
  return icons;
};
var getIcons$1 = getIcons;

var script$17 = {
    name: 'BIcon',
    props: {
        type: [String, Object],
        component: String,
        pack: String,
        icon: String,
        size: String,
        customSize: String,
        customClass: String,
        both: Boolean // This is used internally to show both MDI and FA icon
    },
    computed: {
        iconConfig() {
            const allIcons = getIcons$1();
            return allIcons[this.newPack]
        },
        iconPrefix() {
            if (this.iconConfig && this.iconConfig.iconPrefix) {
                return this.iconConfig.iconPrefix
            }
            return ''
        },
        /**
        * Internal icon name based on the pack.
        * If pack is 'fa', gets the equivalent FA icon name of the MDI,
        * internal icons are always MDI.
        */
        newIcon() {
            return `${this.iconPrefix}${this.getEquivalentIconOf(this.icon)}`
        },
        newPack() {
            return this.pack || config.defaultIconPack
        },
        newType() {
            if (!this.type) return

            let splitType = [];
            if (typeof this.type === 'string') {
                splitType = this.type.split('-');
            } else {
                for (const key in this.type) {
                    if (this.type[key]) {
                        splitType = key.split('-');
                        break
                    }
                }
            }
            if (splitType.length <= 1) return

            const [, ...type] = splitType;
            return `has-text-${type.join('-')}`
        },
        newCustomSize() {
            return this.customSize || this.customSizeByPack
        },
        customSizeByPack() {
            if (this.iconConfig && this.iconConfig.sizes) {
                if (this.size && this.iconConfig.sizes[this.size] !== undefined) {
                    return this.iconConfig.sizes[this.size]
                } else if (this.iconConfig.sizes.default) {
                    return this.iconConfig.sizes.default
                }
            }
            return null
        },
        useIconComponent() {
            return this.component || config.defaultIconComponent
        }
    },
    methods: {
        /**
        * Equivalent icon name of the MDI.
        */
        getEquivalentIconOf(value) {
            // Only transform the class if the both prop is set to true
            if (!this.both) {
                return value
            }

            if (this.iconConfig &&
                this.iconConfig.internalIcons &&
                this.iconConfig.internalIcons[value]) {
                return this.iconConfig.internalIcons[value]
            }
            return value
        }
    }
};

function render$$(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("span", {
    class: normalizeClass(["icon", [$options.newType, $props.size]])
  }, [
    (!$options.useIconComponent)
      ? (openBlock(), createElementBlock("i", {
          key: 0,
          class: normalizeClass([$options.newPack, $options.newIcon, $options.newCustomSize, $props.customClass])
        }, null, 2 /* CLASS */))
      : (openBlock(), createBlock(resolveDynamicComponent($options.useIconComponent), {
          key: 1,
          icon: [$options.newPack, $options.newIcon],
          size: $options.newCustomSize,
          class: normalizeClass([$props.customClass])
        }, null, 8 /* PROPS */, ["icon", "size", "class"]))
  ], 2 /* CLASS */))
}

script$17.render = render$$;
script$17.__file = "src/components/icon/Icon.vue";

var script$16 = {
    name: 'BInput',
    components: {
        [script$17.name]: script$17
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    props: {
        modelValue: [Number, String],
        type: {
            type: String,
            default: 'text'
        },
        lazy: {
            type: Boolean,
            default: false
        },
        passwordReveal: Boolean,
        iconClickable: Boolean,
        hasCounter: {
            type: Boolean,
            default: () => config.defaultInputHasCounter
        },
        customClass: {
            type: String,
            default: ''
        },
        iconRight: String,
        iconRightClickable: Boolean,
        iconRightType: String
    },
    emits: [
        'icon-click',
        'icon-right-click',
        'update:modelValue'
    ],
    data() {
        return {
            newValue: this.modelValue,
            newType: this.type,
            newAutocomplete: this.autocomplete || config.defaultInputAutocomplete,
            isPasswordVisible: false,
            _elementRef: this.type === 'textarea'
                ? 'textarea'
                : 'input'
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.newValue
            },
            set(value) {
                this.newValue = value;
                this.$emit('update:modelValue', value);
            }
        },
        rootClasses() {
            return [
                this.iconPosition,
                this.size,
                {
                    'is-expanded': this.expanded,
                    'is-loading': this.loading,
                    'is-clearfix': !this.hasMessage
                }
            ]
        },
        inputClasses() {
            return [
                this.statusType,
                this.size,
                { 'is-rounded': this.rounded }
            ]
        },
        hasIconRight() {
            return this.passwordReveal ||
                this.loading || (this.statusIcon && this.statusTypeIcon) || this.iconRight
        },
        rightIcon() {
            if (this.passwordReveal) {
                return this.passwordVisibleIcon
            } else if (this.iconRight) {
                return this.iconRight
            }
            return this.statusTypeIcon
        },
        rightIconType() {
            if (this.passwordReveal) {
                return 'is-primary'
            } else if (this.iconRight) {
                return this.iconRightType || null
            }
            return this.statusType
        },

        /**
        * Position of the icon or if it's both sides.
        */
        iconPosition() {
            let iconClasses = '';

            if (this.icon) {
                iconClasses += 'has-icons-left ';
            }

            if (this.hasIconRight) {
                iconClasses += 'has-icons-right';
            }

            return iconClasses
        },

        /**
        * Icon name (MDI) based on the type.
        */
        statusTypeIcon() {
            switch (this.statusType) {
                case 'is-success': return 'check'
                case 'is-danger': return 'alert-circle'
                case 'is-info': return 'information'
                case 'is-warning': return 'alert'
                default: return undefined
            }
        },

        /**
        * Check if have any message prop from parent if it's a Field.
        */
        hasMessage() {
            return !!this.statusMessage
        },

        /**
        * Current password-reveal icon name.
        */
        passwordVisibleIcon() {
            return !this.isPasswordVisible ? 'eye' : 'eye-off'
        },
        /**
        * Get value length
        */
        valueLength() {
            if (typeof this.computedValue === 'string') {
                return Array.from(this.computedValue).length
            } else if (typeof this.computedValue === 'number') {
                return this.computedValue.toString().length
            }
            return 0
        }
    },
    watch: {
        /**
        * When v-model is changed:
        *   1. Set internal value.
        */
        modelValue(value) {
            this.newValue = value;
        },
        type(type) {
            this.newType = type;
        }
    },
    methods: {
        /**
        * Toggle the visibility of a password-reveal input
        * by changing the type and focus the input right away.
        */
        togglePasswordVisibility() {
            this.isPasswordVisible = !this.isPasswordVisible;
            this.newType = this.isPasswordVisible ? 'text' : 'password';

            this.$nextTick(() => {
                this.focus();
            });
        },

        iconClick(emit, event) {
            this.$emit(emit, event);
            this.$nextTick(() => {
                this.focus();
            });
        },

        rightIconClick(event) {
            if (this.passwordReveal) {
                this.togglePasswordVisibility();
            } else if (this.iconRightClickable) {
                this.iconClick('icon-right-click', event);
            }
        },

        onInput(event) {
            if (!this.lazy) {
                const value = event.target.value;
                this.updateValue(value);
            }
        },

        onChange(event) {
            if (this.lazy) {
                const value = event.target.value;
                this.updateValue(value);
            }
        },

        updateValue(value) {
            this.computedValue = value;
            !this.isValid && this.checkHtml5Validity();
        }
    }
};

const _hoisted_1$S = ["type", "autocomplete", "maxlength", "value"];
const _hoisted_2$I = ["maxlength", "value"];

function render$_(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["control", $options.rootClasses])
  }, [
    ($props.type !== 'textarea')
      ? (openBlock(), createElementBlock("input", mergeProps({
          key: 0,
          ref: "input",
          class: ["input", [$options.inputClasses, $props.customClass]],
          type: $data.newType,
          autocomplete: $data.newAutocomplete,
          maxlength: _ctx.maxlength,
          value: $options.computedValue
        }, _ctx.$attrs, {
          onInput: _cache[0] || (_cache[0] = (...args) => ($options.onInput && $options.onInput(...args))),
          onChange: _cache[1] || (_cache[1] = (...args) => ($options.onChange && $options.onChange(...args))),
          onBlur: _cache[2] || (_cache[2] = (...args) => (_ctx.onBlur && _ctx.onBlur(...args))),
          onFocus: _cache[3] || (_cache[3] = (...args) => (_ctx.onFocus && _ctx.onFocus(...args)))
        }), null, 16 /* FULL_PROPS */, _hoisted_1$S))
      : (openBlock(), createElementBlock("textarea", mergeProps({
          key: 1,
          ref: "textarea",
          class: ["textarea", [$options.inputClasses, $props.customClass]],
          maxlength: _ctx.maxlength,
          value: $options.computedValue
        }, _ctx.$attrs, {
          onInput: _cache[4] || (_cache[4] = (...args) => ($options.onInput && $options.onInput(...args))),
          onChange: _cache[5] || (_cache[5] = (...args) => ($options.onChange && $options.onChange(...args))),
          onBlur: _cache[6] || (_cache[6] = (...args) => (_ctx.onBlur && _ctx.onBlur(...args))),
          onFocus: _cache[7] || (_cache[7] = (...args) => (_ctx.onFocus && _ctx.onFocus(...args)))
        }), null, 16 /* FULL_PROPS */, _hoisted_2$I)),
    (_ctx.icon)
      ? (openBlock(), createBlock(_component_b_icon, {
          key: 2,
          class: normalizeClass(["is-left", {'is-clickable': $props.iconClickable}]),
          icon: _ctx.icon,
          pack: _ctx.iconPack,
          size: _ctx.iconSize,
          onClick: _cache[8] || (_cache[8] = $event => ($options.iconClick('icon-click', $event)))
        }, null, 8 /* PROPS */, ["class", "icon", "pack", "size"]))
      : createCommentVNode("v-if", true),
    (!_ctx.loading && $options.hasIconRight)
      ? (openBlock(), createBlock(_component_b_icon, {
          key: 3,
          class: normalizeClass(["is-right", { 'is-clickable': $props.passwordReveal || $props.iconRightClickable }]),
          icon: $options.rightIcon,
          pack: _ctx.iconPack,
          size: _ctx.iconSize,
          type: $options.rightIconType,
          both: "",
          onClick: $options.rightIconClick
        }, null, 8 /* PROPS */, ["class", "icon", "pack", "size", "type", "onClick"]))
      : createCommentVNode("v-if", true),
    (_ctx.maxlength && $props.hasCounter && $props.type !== 'number')
      ? (openBlock(), createElementBlock("small", {
          key: 4,
          class: normalizeClass(["help counter", { 'is-invisible': !_ctx.isFocused }])
        }, toDisplayString($options.valueLength) + " / " + toDisplayString(_ctx.maxlength), 3 /* TEXT, CLASS */))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$16.render = render$_;
script$16.__file = "src/components/input/Input.vue";

var script$15 = {
    name: 'BAutocomplete',
    components: {
        [script$16.name]: script$16
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    props: {
        modelValue: [Number, String],
        data: {
            type: Array,
            default: () => []
        },
        field: {
            type: String,
            default: 'value'
        },
        keepFirst: Boolean,
        clearOnSelect: Boolean,
        openOnFocus: Boolean,
        customFormatter: Function,
        checkInfiniteScroll: Boolean,
        keepOpen: Boolean,
        selectOnClickOutside: Boolean,
        clearable: Boolean,
        maxHeight: [String, Number],
        dropdownPosition: {
            type: String,
            default: 'auto'
        },
        groupField: String,
        groupOptions: String,
        iconRight: String,
        iconRightClickable: Boolean,
        appendToBody: Boolean,
        type: {
            type: String,
            default: 'text'
        },
        confirmKeys: {
            type: Array,
            default: () => ['Tab', 'Enter']
        },
        selectableHeader: Boolean,
        selectableFooter: Boolean
    },
    emits: [
        'blur',
        'focus',
        'icon-click',
        'icon-right-click',
        'infinite-scroll',
        'select',
        'select-footer',
        'select-header',
        'typing',
        'update:modelValue'
    ],
    data() {
        return {
            selected: null,
            hovered: null,
            headerHovered: null,
            footerHovered: null,
            isActive: false,
            newValue: this.modelValue,
            newAutocomplete: this.autocomplete || 'off',
            ariaAutocomplete: this.keepFirst ? 'both' : 'list',
            isListInViewportVertically: true,
            hasFocus: false,
            style: {},
            _isAutocomplete: true,
            _elementRef: 'input',
            _bodyEl: undefined // Used to append to body
        }
    },
    computed: {
        computedData() {
            if (this.groupField) {
                if (this.groupOptions) {
                    const newData = [];
                    this.data.forEach((option) => {
                        const group = getValueByPath(option, this.groupField);
                        const items = getValueByPath(option, this.groupOptions);
                        newData.push({ group, items });
                    });
                    return newData
                } else {
                    const tmp = {};
                    this.data.forEach((option) => {
                        const group = getValueByPath(option, this.groupField);
                        if (!tmp[group]) tmp[group] = [];
                        tmp[group].push(option);
                    });
                    const newData = [];
                    Object.keys(tmp).forEach((group) => {
                        newData.push({ group, items: tmp[group] });
                    });
                    return newData
                }
            }
            return [{ items: this.data }]
        },
        isEmpty() {
            if (!this.computedData) return true
            return !this.computedData.some((element) => element.items && element.items.length)
        },
        /**
         * White-listed items to not close when clicked.
         * Add input, dropdown and all children.
         */
        whiteList() {
            const whiteList = [];
            whiteList.push(this.$refs.input.$el.querySelector('input'));
            whiteList.push(this.$refs.dropdown);
            // Add all children from dropdown
            if (this.$refs.dropdown != null) {
                const children = this.$refs.dropdown.querySelectorAll('*');
                for (const child of children) {
                    whiteList.push(child);
                }
            }
            if (this.$parent.$data._isTaginput) {
                // Add taginput container
                whiteList.push(this.$parent.$el);
                // Add .tag and .delete
                const tagInputChildren = this.$parent.$el.querySelectorAll('*');
                for (const tagInputChild of tagInputChildren) {
                    whiteList.push(tagInputChild);
                }
            }

            return whiteList
        },

        /**
         * Check if exists default slot
         */
        hasDefaultSlot() {
            return !!this.$slots.default
        },

        /**
         * Check if exists group slot
         */
        hasGroupSlot() {
            return !!this.$slots.group
        },

        /**
         * Check if exists "empty" slot
         */
        hasEmptySlot() {
            return !!this.$slots.empty
        },

        /**
         * Check if exists "header" slot
         */
        hasHeaderSlot() {
            return !!this.$slots.header
        },

        /**
         * Check if exists "footer" slot
         */
        hasFooterSlot() {
            return !!this.$slots.footer
        },

        /**
         * Apply dropdownPosition property
         */
        isOpenedTop() {
            return (
                this.dropdownPosition === 'top' ||
                    (this.dropdownPosition === 'auto' && !this.isListInViewportVertically)
            )
        },

        newIconRight() {
            if (this.clearable && this.newValue) {
                return 'close-circle'
            }
            return this.iconRight
        },

        newIconRightClickable() {
            if (this.clearable) {
                return true
            }
            return this.iconRightClickable
        },

        contentStyle() {
            return {
                maxHeight: toCssWidth(this.maxHeight)
            }
        }
    },
    watch: {
        /**
         * When dropdown is toggled, check the visibility to know when
         * to open upwards.
         */
        isActive(active) {
            if (this.dropdownPosition === 'auto') {
                if (active) {
                    this.calcDropdownInViewportVertical();
                } else {
                    // Timeout to wait for the animation to finish before recalculating
                    setTimeout(() => {
                        this.calcDropdownInViewportVertical();
                    }, 100);
                }
            }
        },

        /**
         * When checkInfiniteScroll property changes scroll event should be removed or added
         */
        checkInfiniteScroll(checkInfiniteScroll) {
            if ((this.$refs.dropdown && this.$refs.dropdown.querySelector('.dropdown-content')) === false) return

            const list = this.$refs.dropdown.querySelector('.dropdown-content');

            if (checkInfiniteScroll === true) {
                list.addEventListener('scroll', this.checkIfReachedTheEndOfScroll);

                return
            }

            list.removeEventListener('scroll', this.checkIfReachedTheEndOfScroll);
        },

        /**
         * When updating input's value
         *   1. Emit changes
         *   2. If value isn't the same as selected, set null
         *   3. Close dropdown if value is clear or else open it
         */
        newValue(value) {
            this.$emit('update:modelValue', value);
            // Check if selected is invalid
            const currentValue = this.getValue(this.selected);
            if (currentValue && currentValue !== value) {
                this.setSelected(null, false);
            }
            // Close dropdown if input is clear or else open it
            if (this.hasFocus && (!this.openOnFocus || value)) {
                this.isActive = !!value;
            }
        },

        /**
         * When v-model is changed:
         *   1. Update internal value.
         *   2. If it's invalid, validate again.
         */
        modelValue(value) {
            this.newValue = value;
        },

        /**
         * Select first option if "keep-first
         */
        data() {
            // Keep first option always pre-selected
            if (this.keepFirst) {
                this.$nextTick(() => {
                    if (this.isActive) {
                        this.selectFirstOption(this.computedData);
                    } else {
                        this.setHovered(null);
                    }
                });
            } else {
                if (this.hovered) {
                    // reset hovered if list doesn't contain it
                    const hoveredValue = this.getValue(this.hovered);
                    const data = this.computedData.map((d) => d.items)
                        .reduce((a, b) => ([...a, ...b]), []);
                    if (!data.some((d) => this.getValue(d) === hoveredValue)) {
                        this.setHovered(null);
                    }
                }
            }
        }
    },
    methods: {
        /**
         * Set which option is currently hovered.
         */
        setHovered(option) {
            if (option === undefined) return

            this.hovered = option;
        },

        /**
         * Set which option is currently selected, update v-model,
         * update input value and close dropdown.
         */
        setSelected(option, closeDropdown = true, event = undefined) {
            if (option === undefined) return
            this.selected = option;
            this.$emit('select', this.selected, event);
            if (this.selected !== null) {
                if (this.clearOnSelect) {
                    const input = this.$refs.input;
                    input.newValue = '';
                    input.$refs.input.value = '';
                } else {
                    this.newValue = this.getValue(this.selected);
                }
                this.setHovered(null);
            }
            closeDropdown && this.$nextTick(() => {
                this.isActive = false;
            });
            this.checkValidity();
        },

        /**
         * Select first option
         */
        selectFirstOption(computedData) {
            this.$nextTick(() => {
                const nonEmptyElements = computedData.filter(
                    (element) => element.items && element.items.length
                );
                if (nonEmptyElements.length) {
                    const option = nonEmptyElements[0].items[0];
                    this.setHovered(option);
                } else {
                    this.setHovered(null);
                }
            });
        },

        keydown(event) {
            const { key } = event; // cannot destructure preventDefault (https://stackoverflow.com/a/49616808/2774496)
            // prevent emit submit event
            if (key === 'Enter') event.preventDefault();
            // Close dropdown on Tab & no hovered
            if (key === 'Escape' || key === 'Tab') {
                this.isActive = false;
            }

            if (this.confirmKeys.indexOf(key) >= 0) {
                // If adding by comma, don't add the comma to the input
                if (key === ',') event.preventDefault();
                // Close dropdown on select by Tab
                const closeDropdown = !this.keepOpen || key === 'Tab';
                if (this.hovered === null) {
                    // header and footer uses headerHovered && footerHovered. If header or footer
                    // was selected then fire event otherwise just return so a value isn't selected
                    this.checkIfHeaderOrFooterSelected(event, null, closeDropdown);
                    return
                }
                this.setSelected(this.hovered, closeDropdown, event);
            }
        },

        selectHeaderOrFoterByClick(event, origin) {
            this.checkIfHeaderOrFooterSelected(event, { origin: origin });
        },

        /**
         * Check if header or footer was selected.
         */
        checkIfHeaderOrFooterSelected(event, triggerClick, closeDropdown = true) {
            if (this.selectableHeader && (this.headerHovered || (triggerClick && triggerClick.origin === 'header'))) {
                this.$emit('select-header', event);
                this.headerHovered = false;
                if (triggerClick) this.setHovered(null);
                if (closeDropdown) this.isActive = false;
            }
            if (this.selectableFooter && (this.footerHovered || (triggerClick && triggerClick.origin === 'footer'))) {
                this.$emit('select-footer', event);
                this.footerHovered = false;
                if (triggerClick) this.setHovered(null);
                if (closeDropdown) this.isActive = false;
            }
        },

        /**
         * Close dropdown if clicked outside.
         */
        clickedOutside(event) {
            const target = isCustomElement(this) ? event.composedPath()[0] : event.target;
            if (!this.hasFocus && this.whiteList.indexOf(target) < 0) {
                if (this.keepFirst && this.hovered && this.selectOnClickOutside) {
                    this.setSelected(this.hovered, true);
                } else {
                    this.isActive = false;
                }
            }
        },

        /**
         * Return display text for the input.
         * If object, get value from path, or else just the value.
         */
        getValue(option) {
            if (option === null) return

            if (typeof this.customFormatter !== 'undefined') {
                return this.customFormatter(option)
            }
            return typeof option === 'object' ? getValueByPath(option, this.field) : option
        },

        /**
         * Check if the scroll list inside the dropdown
         * reached it's end.
         */
        checkIfReachedTheEndOfScroll() {
            const list = this.$refs.dropdown.querySelector('.dropdown-content');
            const footerHeight = this.hasFooterSlot ? list.querySelectorAll('div.dropdown-footer')[0].clientHeight : 0;
            if (list.clientHeight !== list.scrollHeight &&
                list.scrollTop + list.parentElement.clientHeight + footerHeight >= list.scrollHeight
            ) {
                this.$emit('infinite-scroll');
            }
        },

        /**
         * Calculate if the dropdown is vertically visible when activated,
         * otherwise it is openened upwards.
         */
        calcDropdownInViewportVertical() {
            this.$nextTick(() => {
                /**
                 * this.$refs.dropdown may be undefined
                 * when Autocomplete is conditional rendered
                 */
                if (this.$refs.dropdown == null) return

                const rect = this.$refs.dropdown.getBoundingClientRect();

                this.isListInViewportVertically = rect.top >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
                if (this.appendToBody) {
                    this.updateAppendToBody();
                }
            });
        },

        /**
         * Arrows keys listener.
         * If dropdown is active, set hovered option, or else just open.
         */
        keyArrows(direction) {
            const sum = direction === 'down' ? 1 : -1;
            if (this.isActive) {
                const data = this.computedData.map(
                    (d) => d.items).reduce((a, b) => ([...a, ...b]), []);
                if (this.hasHeaderSlot && this.selectableHeader) {
                    data.unshift(undefined);
                }
                if (this.hasFooterSlot && this.selectableFooter) {
                    data.push(undefined);
                }

                let index;
                if (this.headerHovered) {
                    index = 0 + sum;
                } else if (this.footerHovered) {
                    index = (data.length - 1) + sum;
                } else {
                    index = data.indexOf(this.hovered) + sum;
                }

                index = index > data.length - 1 ? data.length - 1 : index;
                index = index < 0 ? 0 : index;

                this.footerHovered = false;
                this.headerHovered = false;
                this.setHovered(data[index] !== undefined ? data[index] : null);
                if (this.hasFooterSlot && this.selectableFooter && index === data.length - 1) {
                    this.footerHovered = true;
                }
                if (this.hasHeaderSlot && this.selectableHeader && index === 0) {
                    this.headerHovered = true;
                }

                const list = this.$refs.dropdown.querySelector('.dropdown-content');
                let querySelectorText = 'a.dropdown-item:not(.is-disabled)';
                if (this.hasHeaderSlot && this.selectableHeader) {
                    querySelectorText += ',div.dropdown-header';
                }
                if (this.hasFooterSlot && this.selectableFooter) {
                    querySelectorText += ',div.dropdown-footer';
                }
                const element = list.querySelectorAll(querySelectorText)[index];

                if (!element) return

                const visMin = list.scrollTop;
                const visMax = list.scrollTop + list.clientHeight - element.clientHeight;

                if (element.offsetTop < visMin) {
                    list.scrollTop = element.offsetTop;
                } else if (element.offsetTop >= visMax) {
                    list.scrollTop = element.offsetTop - list.clientHeight + element.clientHeight;
                }
            } else {
                this.isActive = true;
            }
        },

        /**
         * Focus listener.
         * If value is the same as selected, select all text.
         */
        focused(event) {
            if (this.getValue(this.selected) === this.newValue) {
                this.$el.querySelector('input').select();
            }
            if (this.openOnFocus) {
                this.isActive = true;
                if (this.keepFirst) {
                    // If open on focus, update the hovered
                    this.selectFirstOption(this.computedData);
                }
            }
            this.hasFocus = true;
            this.$emit('focus', event);
        },

        /**
         * Blur listener.
         */
        onBlur(event) {
            this.hasFocus = false;
            this.$emit('blur', event);
        },
        onInput() {
            const currentValue = this.getValue(this.selected);
            if (currentValue && currentValue === this.newValue) return
            this.$emit('typing', this.newValue);
            this.checkValidity();
        },
        rightIconClick(event) {
            if (this.clearable) {
                this.newValue = '';
                this.setSelected(null, false);
                if (this.openOnFocus) {
                    this.$refs.input.$el.focus();
                }
            } else {
                this.$emit('icon-right-click', event);
            }
        },
        checkValidity() {
            if (this.useHtml5Validation) {
                this.$nextTick(() => {
                    this.checkHtml5Validity();
                });
            }
        },
        updateAppendToBody() {
            const dropdownMenu = this.$refs.dropdown;
            const trigger = this.$refs.input.$el;
            if (dropdownMenu && trigger) {
                // update wrapper dropdown
                const root = this.$data._bodyEl;
                root.classList.forEach((item) => root.classList.remove(item));
                root.classList.add('autocomplete');
                root.classList.add('control');
                if (this.expandend) {
                    root.classList.add('is-expandend');
                }
                const rect = trigger.getBoundingClientRect();
                let top = rect.top + window.scrollY;
                const left = rect.left + window.scrollX;
                if (!this.isOpenedTop) {
                    top += trigger.clientHeight;
                } else {
                    top -= dropdownMenu.clientHeight;
                }
                this.style = {
                    position: 'absolute',
                    top: `${top}px`,
                    left: `${left}px`,
                    width: `${trigger.clientWidth}px`,
                    maxWidth: `${trigger.clientWidth}px`,
                    zIndex: '99'
                };
            }
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('click', this.clickedOutside);
            if (this.dropdownPosition === 'auto') { window.addEventListener('resize', this.calcDropdownInViewportVertical); }
        }
    },
    mounted() {
        if (this.checkInfiniteScroll &&
            this.$refs.dropdown && this.$refs.dropdown.querySelector('.dropdown-content')
        ) {
            const list = this.$refs.dropdown.querySelector('.dropdown-content');
            list.addEventListener('scroll', this.checkIfReachedTheEndOfScroll);
        }
        if (this.appendToBody) {
            this.$data._bodyEl = createAbsoluteElement(this.$refs.dropdown);
            this.updateAppendToBody();
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('click', this.clickedOutside);
            if (this.dropdownPosition === 'auto') { window.removeEventListener('resize', this.calcDropdownInViewportVertical); }
        }
        if (this.checkInfiniteScroll &&
            this.$refs.dropdown && this.$refs.dropdown.querySelector('.dropdown-content')
        ) {
            const list = this.$refs.dropdown.querySelector('.dropdown-content');
            list.removeEventListener('scroll', this.checkIfReachedTheEndOfScroll);
        }
        if (this.appendToBody) {
            removeElement(this.$data._bodyEl);
        }
    }
};

const _hoisted_1$R = {
  key: 1,
  class: "has-text-weight-bold"
};
const _hoisted_2$H = ["onClick"];
const _hoisted_3$t = { key: 1 };
const _hoisted_4$k = {
  key: 1,
  class: "dropdown-item is-disabled"
};

function render$Z(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_input = resolveComponent("b-input");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["autocomplete control", { 'is-expanded': _ctx.expanded }])
  }, [
    createVNode(_component_b_input, mergeProps({
      modelValue: $data.newValue,
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($data.newValue) = $event)),
      ref: "input",
      type: $props.type,
      size: _ctx.size,
      loading: _ctx.loading,
      rounded: _ctx.rounded,
      icon: _ctx.icon,
      "icon-right": $options.newIconRight,
      "icon-right-clickable": $options.newIconRightClickable,
      "icon-pack": _ctx.iconPack,
      maxlength: _ctx.maxlength,
      autocomplete: $data.newAutocomplete,
      "use-html5-validation": false,
      "aria-autocomplete": $data.ariaAutocomplete
    }, _ctx.$attrs, {
      "onUpdate:modelValue": $options.onInput,
      onFocus: $options.focused,
      onBlur: $options.onBlur,
      onKeydown: [
        $options.keydown,
        _cache[1] || (_cache[1] = withKeys(withModifiers($event => ($options.keyArrows('up')), ["prevent"]), ["up"])),
        _cache[2] || (_cache[2] = withKeys(withModifiers($event => ($options.keyArrows('down')), ["prevent"]), ["down"]))
      ],
      onIconRightClick: $options.rightIconClick,
      onIconClick: _cache[3] || (_cache[3] = (event) => _ctx.$emit('icon-click', event))
    }), null, 16 /* FULL_PROPS */, ["modelValue", "type", "size", "loading", "rounded", "icon", "icon-right", "icon-right-clickable", "icon-pack", "maxlength", "autocomplete", "aria-autocomplete", "onUpdate:modelValue", "onFocus", "onBlur", "onKeydown", "onIconRightClick"]),
    createVNode(Transition, {
      name: "fade",
      persisted: ""
    }, {
      default: withCtx(() => [
        withDirectives(createElementVNode("div", {
          class: normalizeClass(["dropdown-menu", { 'is-opened-top': $options.isOpenedTop && !$props.appendToBody }]),
          style: normalizeStyle($data.style),
          ref: "dropdown"
        }, [
          withDirectives(createElementVNode("div", {
            class: "dropdown-content",
            style: normalizeStyle($options.contentStyle)
          }, [
            ($options.hasHeaderSlot)
              ? (openBlock(), createElementBlock("div", {
                  key: 0,
                  class: normalizeClass(["dropdown-item dropdown-header", { 'is-hovered': $data.headerHovered }]),
                  role: "button",
                  tabindex: "0",
                  onClick: _cache[4] || (_cache[4] = $event => ($options.selectHeaderOrFoterByClick($event, 'header')))
                }, [
                  renderSlot(_ctx.$slots, "header")
                ], 2 /* CLASS */))
              : createCommentVNode("v-if", true),
            (openBlock(true), createElementBlock(Fragment, null, renderList($options.computedData, (element, groupindex) => {
              return (openBlock(), createElementBlock(Fragment, null, [
                (element.group)
                  ? (openBlock(), createElementBlock("div", {
                      key: groupindex + 'group',
                      class: "dropdown-item"
                    }, [
                      ($options.hasGroupSlot)
                        ? renderSlot(_ctx.$slots, "group", {
                            key: 0,
                            group: element.group,
                            index: groupindex
                          })
                        : (openBlock(), createElementBlock("span", _hoisted_1$R, toDisplayString(element.group), 1 /* TEXT */))
                    ]))
                  : createCommentVNode("v-if", true),
                (openBlock(true), createElementBlock(Fragment, null, renderList(element.items, (option, index) => {
                  return (openBlock(), createElementBlock("a", {
                    key: groupindex + ':' + index,
                    class: normalizeClass(["dropdown-item", { 'is-hovered': option === $data.hovered }]),
                    role: "button",
                    tabindex: "0",
                    onClick: withModifiers($event => ($options.setSelected(option, !$props.keepOpen, $event)), ["stop"])
                  }, [
                    ($options.hasDefaultSlot)
                      ? renderSlot(_ctx.$slots, "default", {
                          key: 0,
                          option: option,
                          index: index
                        })
                      : (openBlock(), createElementBlock("span", _hoisted_3$t, toDisplayString($options.getValue(option, true)), 1 /* TEXT */))
                  ], 10 /* CLASS, PROPS */, _hoisted_2$H))
                }), 128 /* KEYED_FRAGMENT */))
              ], 64 /* STABLE_FRAGMENT */))
            }), 256 /* UNKEYED_FRAGMENT */)),
            ($options.isEmpty && $options.hasEmptySlot)
              ? (openBlock(), createElementBlock("div", _hoisted_4$k, [
                  renderSlot(_ctx.$slots, "empty")
                ]))
              : createCommentVNode("v-if", true),
            ($options.hasFooterSlot)
              ? (openBlock(), createElementBlock("div", {
                  key: 2,
                  class: normalizeClass(["dropdown-item dropdown-footer", { 'is-hovered': $data.footerHovered }]),
                  role: "button",
                  tabindex: "0",
                  onClick: _cache[5] || (_cache[5] = $event => ($options.selectHeaderOrFoterByClick($event, 'footer')))
                }, [
                  renderSlot(_ctx.$slots, "footer")
                ], 2 /* CLASS */))
              : createCommentVNode("v-if", true)
          ], 4 /* STYLE */), [
            [vShow, $data.isActive]
          ])
        ], 6 /* CLASS, STYLE */), [
          [vShow, $data.isActive && (!$options.isEmpty || $options.hasEmptySlot || $options.hasHeaderSlot)]
        ])
      ]),
      _: 3 /* FORWARDED */
    })
  ], 2 /* CLASS */))
}

script$15.render = render$Z;
script$15.__file = "src/components/autocomplete/Autocomplete.vue";

var use = function use(plugin) {
  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
  }
};
var registerComponent = function registerComponent(Vue, component) {
  Vue.component(component.name, component);
};
var registerComponentProgrammatic = function registerComponentProgrammatic(Vue, property, component) {
  if (!Vue.config.globalProperties.$buefy) Vue.config.globalProperties.$buefy = {};
  Vue.config.globalProperties.$buefy[property] = component;
};

var Plugin$1i = {
  install: function install(Vue) {
    registerComponent(Vue, script$15);
  }
};
use(Plugin$1i);
var Plugin$1j = Plugin$1i;

var script$14 = {
    name: 'BBreadcrumb',
    props: {
        align: {
            type: String,
            default: () => {
                return config.defaultBreadcrumbAlign
            }
        },
        separator: {
            type: String,
            default: () => {
                return config.defaultBreadcrumbSeparator
            }
        },
        size: {
            type: String,
            default: () => {
                return config.defaultBreadcrumbSize
            }
        }
    },

    computed: {
        breadcrumbClasses() {
            return ['breadcrumb', this.align, this.separator, this.size]
        }
    }
};

function render$Y(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("nav", {
    class: normalizeClass($options.breadcrumbClasses)
  }, [
    createElementVNode("ul", null, [
      renderSlot(_ctx.$slots, "default")
    ])
  ], 2 /* CLASS */))
}

script$14.render = render$Y;
script$14.__file = "src/components/breadcrumb/Breadcrumb.vue";

var script$13 = {
    name: 'BBreadcrumbItem',
    inheritAttrs: false,
    props: {
        tag: {
            type: String,
            default: () => {
                return config.defaultBreadcrumbTag
            }
        },
        active: Boolean
    }
};

function render$X(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("li", {
    class: normalizeClass({ 'is-active': $props.active })
  }, [
    (openBlock(), createBlock(resolveDynamicComponent($props.tag), normalizeProps(guardReactiveProps(_ctx.$attrs)), {
      default: withCtx(() => [
        renderSlot(_ctx.$slots, "default")
      ]),
      _: 3 /* FORWARDED */
    }, 16 /* FULL_PROPS */))
  ], 2 /* CLASS */))
}

script$13.render = render$X;
script$13.__file = "src/components/breadcrumb/BreadcrumbItem.vue";

var Plugin$1g = {
  install: function install(Vue) {
    registerComponent(Vue, script$14);
    registerComponent(Vue, script$13);
  }
};
use(Plugin$1g);
var Plugin$1h = Plugin$1g;

var script$12 = {
    name: 'BButton',
    components: {
        [script$17.name]: script$17
    },
    inheritAttrs: false,
    props: {
        type: [String, Object],
        size: String,
        label: String,
        iconPack: String,
        iconLeft: String,
        iconRight: String,
        rounded: {
            type: Boolean,
            default: () => {
                return config.defaultButtonRounded
            }
        },
        loading: Boolean,
        outlined: Boolean,
        expanded: Boolean,
        inverted: Boolean,
        focused: Boolean,
        active: Boolean,
        hovered: Boolean,
        selected: Boolean,
        nativeType: {
            type: String,
            default: 'button',
            validator: (value) => {
                return [
                    'button',
                    'submit',
                    'reset'
                ].indexOf(value) >= 0
            }
        },
        tag: {
            type: String,
            default: 'button',
            validator: (value) => {
                return config.defaultLinkTags.indexOf(value) >= 0
            }
        }
    },
    computed: {
        computedTag() {
            if (this.$attrs.disabled !== undefined && this.$attrs.disabled !== false) {
                return 'button'
            }
            return this.tag
        },
        iconSize() {
            if (!this.size || this.size === 'is-medium') {
                return 'is-small'
            } else if (this.size === 'is-large') {
                return 'is-medium'
            }
            return this.size
        }
    }
};

const _hoisted_1$Q = { key: 1 };
const _hoisted_2$G = { key: 2 };

function render$W(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createBlock(resolveDynamicComponent($options.computedTag), mergeProps({ class: "button" }, _ctx.$attrs, {
    type: $options.computedTag === 'button' ? $props.nativeType : undefined,
    class: [$props.size, $props.type, {
            'is-rounded': $props.rounded,
            'is-loading': $props.loading,
            'is-outlined': $props.outlined,
            'is-fullwidth': $props.expanded,
            'is-inverted': $props.inverted,
            'is-focused': $props.focused,
            'is-active': $props.active,
            'is-hovered': $props.hovered,
            'is-selected': $props.selected
        }]
  }), {
    default: withCtx(() => [
      ($props.iconLeft)
        ? (openBlock(), createBlock(_component_b_icon, {
            key: 0,
            pack: $props.iconPack,
            icon: $props.iconLeft,
            size: $options.iconSize
          }, null, 8 /* PROPS */, ["pack", "icon", "size"]))
        : createCommentVNode("v-if", true),
      ($props.label)
        ? (openBlock(), createElementBlock("span", _hoisted_1$Q, toDisplayString($props.label), 1 /* TEXT */))
        : (_ctx.$slots.default)
          ? (openBlock(), createElementBlock("span", _hoisted_2$G, [
              renderSlot(_ctx.$slots, "default")
            ]))
          : createCommentVNode("v-if", true),
      ($props.iconRight)
        ? (openBlock(), createBlock(_component_b_icon, {
            key: 3,
            pack: $props.iconPack,
            icon: $props.iconRight,
            size: $options.iconSize
          }, null, 8 /* PROPS */, ["pack", "icon", "size"]))
        : createCommentVNode("v-if", true)
    ]),
    _: 3 /* FORWARDED */
  }, 16 /* FULL_PROPS */, ["type", "class"]))
}

script$12.render = render$W;
script$12.__file = "src/components/button/Button.vue";

var Plugin$1e = {
  install: function install(Vue) {
    registerComponent(Vue, script$12);
  }
};
use(Plugin$1e);
var Plugin$1f = Plugin$1e;

function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$8(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var items = 1;
var sorted$1 = 3;
var Sorted$1 = sorted$1;
var ProviderParentMixin = (function (itemName) {
  var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var mixin = {
    provide: function provide() {
      return _defineProperty({}, 'b' + itemName, this);
    }
  };
  if (hasFlag(flags, items)) {
    mixin.data = function () {
      return _objectSpread$8({
        childItems: []
      }, hasFlag(flags, sorted$1) ? {
        nextIndex: 0
      } : {});
    };
    mixin.methods = {
      _registerItem: function _registerItem(item) {
        if (hasFlag(flags, sorted$1)) {
          // assigns a dynamic index.
          // dynamic indices will be messed up if any child is
          // unmounted.
          // use the new `order` prop to maintain the ordering.
          item.dynamicIndex = this.nextIndex;
          ++this.nextIndex;
        }
        this.childItems.push(item);
      },
      _unregisterItem: function _unregisterItem(item) {
        this.childItems = this.childItems.filter(function (i) {
          return i.value !== item.value;
        });
      }
    };
    if (hasFlag(flags, sorted$1)) {
      mixin.computed = {
        /**
         * When items are added/removed sort them according to their position
         */
        sortedItems: function sortedItems() {
          return this.childItems.slice().sort(function (i1, i2) {
            return i1.index - i2.index;
          });
        }
      };
    }
  }
  return mixin;
});

var script$11 = {
    name: 'BCarousel',
    components: {
        [script$17.name]: script$17
    },
    mixins: [ProviderParentMixin('carousel', Sorted$1)],
    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        animated: {
            type: String,
            default: 'slide'
        },
        interval: Number,
        hasDrag: {
            type: Boolean,
            default: true
        },
        autoplay: {
            type: Boolean,
            default: true
        },
        pauseHover: {
            type: Boolean,
            default: true
        },
        pauseInfo: {
            type: Boolean,
            default: true
        },
        pauseInfoType: {
            type: String,
            default: 'is-white'
        },
        pauseText: {
            type: String,
            default: 'Pause'
        },
        arrow: {
            type: Boolean,
            default: true
        },
        arrowHover: {
            type: Boolean,
            default: true
        },
        repeat: {
            type: Boolean,
            default: true
        },
        iconPack: String,
        iconSize: String,
        iconPrev: {
            type: String,
            default: () => {
                return config.defaultIconPrev
            }
        },
        iconNext: {
            type: String,
            default: () => {
                return config.defaultIconNext
            }
        },
        indicator: {
            type: Boolean,
            default: true
        },
        indicatorBackground: Boolean,
        indicatorCustom: Boolean,
        indicatorCustomSize: {
            type: String,
            default: 'is-small'
        },
        indicatorInside: {
            type: Boolean,
            default: true
        },
        indicatorMode: {
            type: String,
            default: 'click'
        },
        indicatorPosition: {
            type: String,
            default: 'is-bottom'
        },
        indicatorStyle: {
            type: String,
            default: 'is-dots'
        },
        overlay: Boolean,
        progress: Boolean,
        progressType: {
            type: String,
            default: 'is-primary'
        },
        withCarouselList: Boolean
    },
    emits: ['change', 'click', 'update:modelValue'],
    data() {
        return {
            transition: 'next',
            activeChild: this.modelValue || 0,
            isPause: false,
            dragX: false,
            timer: null
        }
    },
    computed: {
        indicatorClasses() {
            return [
                {
                    'has-background': this.indicatorBackground,
                    'has-custom': this.indicatorCustom,
                    'is-inside': this.indicatorInside
                },
                this.indicatorCustom && this.indicatorCustomSize,
                this.indicatorInside && this.indicatorPosition
            ]
        },

        // checking arrows
        hasPrev() {
            return this.repeat || this.activeChild !== 0
        },
        hasNext() {
            return this.repeat || this.activeChild < this.childItems.length - 1
        }
    },
    watch: {
        /**
         * When v-model is changed set the new active item.
         */
        modelValue(value) {
            this.changeActive(value);
        },
        /**
         * When carousel-items are updated, set active one.
         */
        sortedItems(items) {
            if (this.activeChild >= items.length && this.activeChild > 0) {
                this.changeActive(this.activeChild - 1);
            }
        },
        /**
         *  When autoplay is changed, start or pause timer accordingly
         */
        autoplay(status) {
            status ? this.startTimer() : this.pauseTimer();
        },
        /**
         *  Since the timer can get paused at the end, if repeat is changed we need to restart it
         */
        repeat(status) {
            if (status) { this.startTimer(); }
        }
    },

    methods: {
        startTimer() {
            if (!this.autoplay || this.timer) return
            this.isPause = false;
            this.timer = setInterval(() => {
                if (!this.repeat && this.activeChild >= this.childItems.length - 1) {
                    this.pauseTimer();
                } else {
                    this.next();
                }
            }, (this.interval || config.defaultCarouselInterval));
        },
        pauseTimer() {
            this.isPause = true;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        restartTimer() {
            this.pauseTimer();
            this.startTimer();
        },
        checkPause() {
            if (this.pauseHover && this.autoplay) {
                this.pauseTimer();
            }
        },
        /**
         * Change the active item and emit change event.
         * action only for animated slide, there true = next, false = prev
         */
        changeActive(newIndex, direction = 0) {
            if (this.activeChild === newIndex || isNaN(newIndex)) return

            direction = direction || (newIndex - this.activeChild);

            newIndex = this.repeat
                ? mod(newIndex, this.childItems.length)
                : bound(newIndex, 0, this.childItems.length - 1);

            this.transition = direction > 0 ? 'prev' : 'next';
            // Transition names are reversed from the actual direction for correct effect

            this.activeChild = newIndex;
            if (newIndex !== this.modelValue) {
                this.$emit('update:modelValue', newIndex);
            }
            this.restartTimer();
            this.$emit('change', newIndex); // BC
        },
        // Indicator trigger when change active item.
        modeChange(trigger, value) {
            if (this.indicatorMode === trigger) {
                return this.changeActive(value)
            }
        },
        prev() {
            this.changeActive(this.activeChild - 1, -1);
        },
        next() {
            this.changeActive(this.activeChild + 1, 1);
        },
        // handle drag event
        dragStart(event) {
            if (!this.hasDrag ||
                !event.target.draggable) return
            this.dragX = event.touches ? event.changedTouches[0].pageX : event.pageX;
            if (event.touches) {
                this.pauseTimer();
            } else {
                event.preventDefault();
            }
        },
        dragEnd(event) {
            if (this.dragX === false) return
            const detected = event.touches ? event.changedTouches[0].pageX : event.pageX;
            const diffX = detected - this.dragX;
            if (Math.abs(diffX) > 30) {
                if (diffX < 0) {
                    this.next();
                } else {
                    this.prev();
                }
            } else {
                event.target.click();
                this.sortedItems[this.activeChild].$emit('click');
                this.$emit('click');
            }
            if (event.touches) {
                this.startTimer();
            }
            this.dragX = false;
        }
    },
    mounted() {
        this.startTimer();
    },
    beforeUnmount() {
        this.pauseTimer();
    }
};

const _hoisted_1$P = ["value", "max"];
const _hoisted_2$F = {
  key: 1,
  class: "carousel-pause"
};
const _hoisted_3$s = ["onMouseover", "onClick"];

function render$V(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["carousel", {'is-overlay': $props.overlay}]),
    onMouseenter: _cache[4] || (_cache[4] = (...args) => ($options.checkPause && $options.checkPause(...args))),
    onMouseleave: _cache[5] || (_cache[5] = (...args) => ($options.startTimer && $options.startTimer(...args)))
  }, [
    ($props.progress)
      ? (openBlock(), createElementBlock("progress", {
          key: 0,
          class: normalizeClass(["progress", $props.progressType]),
          value: $data.activeChild,
          max: _ctx.childItems.length - 1
        }, toDisplayString(_ctx.childItems.length - 1), 11 /* TEXT, CLASS, PROPS */, _hoisted_1$P))
      : createCommentVNode("v-if", true),
    createElementVNode("div", {
      class: "carousel-items",
      onMousedown: _cache[0] || (_cache[0] = (...args) => ($options.dragStart && $options.dragStart(...args))),
      onMouseup: _cache[1] || (_cache[1] = (...args) => ($options.dragEnd && $options.dragEnd(...args))),
      onTouchstart: _cache[2] || (_cache[2] = withModifiers((...args) => ($options.dragStart && $options.dragStart(...args)), ["stop"])),
      onTouchend: _cache[3] || (_cache[3] = withModifiers((...args) => ($options.dragEnd && $options.dragEnd(...args)), ["stop"]))
    }, [
      renderSlot(_ctx.$slots, "default"),
      ($props.arrow)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(["carousel-arrow", {'is-hovered': $props.arrowHover}])
          }, [
            withDirectives(createVNode(_component_b_icon, {
              class: "has-icons-left",
              onClick: $options.prev,
              pack: $props.iconPack,
              icon: $props.iconPrev,
              size: $props.iconSize,
              both: ""
            }, null, 8 /* PROPS */, ["onClick", "pack", "icon", "size"]), [
              [vShow, $options.hasPrev]
            ]),
            withDirectives(createVNode(_component_b_icon, {
              class: "has-icons-right",
              onClick: $options.next,
              pack: $props.iconPack,
              icon: $props.iconNext,
              size: $props.iconSize,
              both: ""
            }, null, 8 /* PROPS */, ["onClick", "pack", "icon", "size"]), [
              [vShow, $options.hasNext]
            ])
          ], 2 /* CLASS */))
        : createCommentVNode("v-if", true)
    ], 32 /* HYDRATE_EVENTS */),
    ($props.autoplay && $props.pauseHover && $props.pauseInfo && $data.isPause)
      ? (openBlock(), createElementBlock("div", _hoisted_2$F, [
          createElementVNode("span", {
            class: normalizeClass(["tag", $props.pauseInfoType])
          }, toDisplayString($props.pauseText), 3 /* TEXT, CLASS */)
        ]))
      : createCommentVNode("v-if", true),
    ($props.withCarouselList && !$props.indicator)
      ? renderSlot(_ctx.$slots, "list", {
          key: 2,
          active: $data.activeChild,
          switch: $options.changeActive
        })
      : createCommentVNode("v-if", true),
    ($props.indicator)
      ? (openBlock(), createElementBlock("div", {
          key: 3,
          class: normalizeClass(["carousel-indicator", $options.indicatorClasses])
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.sortedItems, (item, index) => {
            return (openBlock(), createElementBlock("a", {
              class: normalizeClass(["indicator-item", {'is-active': item.isActive}]),
              onMouseover: $event => ($options.modeChange('hover', index)),
              onClick: $event => ($options.modeChange('click', index)),
              key: item._uid
            }, [
              renderSlot(_ctx.$slots, "indicators", { i: index }, () => [
                createElementVNode("span", {
                  class: normalizeClass(["indicator-style", $props.indicatorStyle])
                }, null, 2 /* CLASS */)
              ])
            ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_3$s))
          }), 128 /* KEYED_FRAGMENT */))
        ], 2 /* CLASS */))
      : createCommentVNode("v-if", true),
    ($props.overlay)
      ? renderSlot(_ctx.$slots, "overlay", { key: 4 })
      : createCommentVNode("v-if", true)
  ], 34 /* CLASS, HYDRATE_EVENTS */))
}

script$11.render = render$V;
script$11.__file = "src/components/carousel/Carousel.vue";

var sorted = 1;
var optional = 2;
var Sorted = sorted;
var InjectedChildMixin = (function (parentItemName) {
  var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var mixin = {
    inject: {
      parent: {
        from: 'b' + parentItemName,
        default: false
      }
    },
    created: function created() {
      if (!this.parent) {
        if (!hasFlag(flags, optional)) {
          this.$destroy();
          throw new Error('You should wrap ' + this.$options.name + ' in a ' + parentItemName);
        }
      } else if (this.parent._registerItem) {
        this.parent._registerItem(this);
      }
    },
    beforeUnmount: function beforeUnmount() {
      if (this.parent && this.parent._unregisterItem) {
        this.parent._unregisterItem(this);
      }
    }
  };
  if (hasFlag(flags, sorted)) {
    // a user can explicitly specify the `order` prop to keep the order of
    // children.
    // I can no longer rely on automatic indexing of children, because I
    // could not figure out how to calculate the index of a child in its
    // parent on Vue 3.
    // incomplete dynamic indexing is still available if any child is never
    // unmounted; e.g., not switched with `v-if`
    mixin.props = {
      order: {
        type: Number,
        required: false
      }
    };
    mixin.data = function () {
      return {
        dynamicIndex: null
      };
    };
    mixin.computed = {
      index: function index() {
        return this.order != null ? this.order : this.dynamicIndex;
      }
    };
  }
  return mixin;
});

var script$10 = {
    name: 'BCarouselItem',
    mixins: [InjectedChildMixin('carousel', Sorted)],
    data() {
        return {
            transitionName: null
        }
    },
    computed: {
        transition() {
            if (this.parent.animated === 'fade') {
                return 'fade'
            } else if (this.parent.transition) {
                return 'slide-' + this.parent.transition
            } else {
                return undefined
            }
        },
        isActive() {
            return this.parent.activeChild === this.index
        }
    }
};

const _hoisted_1$O = { class: "carousel-item" };

function render$U(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, {
    name: $options.transition,
    persisted: ""
  }, {
    default: withCtx(() => [
      withDirectives(createElementVNode("div", _hoisted_1$O, [
        renderSlot(_ctx.$slots, "default")
      ], 512 /* NEED_PATCH */), [
        [vShow, $options.isActive]
      ])
    ]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["name"]))
}

script$10.render = render$U;
script$10.__file = "src/components/carousel/CarouselItem.vue";

var script$$ = {
    name: 'BImage',
    props: {
        src: String,
        alt: String,
        srcFallback: String,
        webpFallback: {
            type: String,
            default: () => {
                return config.defaultImageWebpFallback
            }
        },
        lazy: {
            type: Boolean,
            default: () => {
                return config.defaultImageLazy
            }
        },
        responsive: {
            type: Boolean,
            default: () => {
                return config.defaultImageResponsive
            }
        },
        ratio: {
            type: String,
            default: () => {
                return config.defaultImageRatio
            }
        },
        placeholder: String,
        srcset: String,
        srcsetSizes: Array,
        srcsetFormatter: {
            type: Function,
            default: (src, size, vm) => {
                if (typeof config.defaultImageSrcsetFormatter === 'function') {
                    return config.defaultImageSrcsetFormatter(src, size)
                } else {
                    return vm.formatSrcset(src, size)
                }
            }
        },
        rounded: {
            type: Boolean,
            default: false
        },
        captionFirst: {
            type: Boolean,
            default: false
        },
        customClass: String
    },
    emits: ['load', 'error'],
    data() {
        return {
            clientWidth: 0,
            webpSupportVerified: false,
            webpSupported: false,
            useNativeLazy: false,
            observer: null,
            inViewPort: false,
            bulmaKnownRatio: ['square', '1by1', '5by4', '4by3', '3by2', '5by3', '16by9', 'b2y1', '3by1', '4by5', '3by4', '2by3', '3by5', '9by16', '1by2', '1by3'],
            loaded: false,
            failed: false
        }
    },
    computed: {
        ratioPattern() {
            return /([0-9]+)by([0-9]+)/
        },
        hasRatio() {
            return this.ratio && this.ratioPattern.test(this.ratio)
        },
        figureClasses() {
            const classes = { image: this.responsive };
            if (this.hasRatio && this.bulmaKnownRatio.indexOf(this.ratio) >= 0) {
                classes[`is-${this.ratio}`] = true;
            }
            return classes
        },
        figureStyles() {
            if (
                this.hasRatio &&
                this.bulmaKnownRatio.indexOf(this.ratio) < 0
            ) {
                const ratioValues = this.ratioPattern.exec(this.ratio);
                return {
                    paddingTop: `${(ratioValues[2] / ratioValues[1]) * 100}%`
                }
            }
            return undefined
        },
        imgClasses() {
            return {
                'is-rounded': this.rounded,
                'has-ratio': this.hasRatio,
                [this.customClass]: !!this.customClass
            }
        },
        srcExt() {
            return this.getExt(this.src)
        },
        isWepb() {
            return this.srcExt === 'webp'
        },
        computedSrc() {
            let src = this.src;
            if (this.failed && this.srcFallback) {
                src = this.srcFallback;
            }
            if (!this.webpSupported && this.isWepb && this.webpFallback) {
                if (this.webpFallback.startsWith('.')) {
                    return src.replace(/\.webp/gi, `${this.webpFallback}`)
                }
                return this.webpFallback
            }
            return src
        },
        computedWidth() {
            if (this.responsive && this.clientWidth > 0) {
                return this.clientWidth
            }
            return undefined
        },
        computedNativeLazy() {
            if (this.lazy && this.useNativeLazy) {
                return 'lazy'
            }
            return undefined
        },
        isDisplayed() {
            return (
                (this.webpSupportVerified || !this.isWepb) &&
                (!this.lazy || this.useNativeLazy || this.inViewPort)
            )
        },
        placeholderExt() {
            if (this.placeholder) {
                return this.getExt(this.placeholder)
            }
            return undefined
        },
        isPlaceholderWepb() {
            if (this.placeholder) {
                return this.placeholderExt === 'webp'
            }
            return false
        },
        computedPlaceholder() {
            if (!this.webpSupported && this.isPlaceholderWepb && this.webpFallback && this.webpFallback.startsWith('.')) {
                return this.placeholder.replace(/\.webp/gi, `${this.webpFallback}`)
            }
            return this.placeholder
        },
        isPlaceholderDisplayed() {
            return (
                !this.loaded &&
                (
                    this.$slots.placeholder || (
                        this.placeholder &&
                        (this.webpSupportVerified || !this.isPlaceholderWepb)
                    )
                )
            )
        },
        computedSrcset() {
            if (this.srcset) {
                if (!this.webpSupported && this.isWepb && this.webpFallback && this.webpFallback.startsWith('.')) {
                    return this.srcset.replace(/\.webp/gi, `${this.webpFallback}`)
                }
                return this.srcset
            }
            if (
                this.srcsetSizes && Array.isArray(this.srcsetSizes) && this.srcsetSizes.length > 0
            ) {
                return this.srcsetSizes.map((size) => {
                    return `${this.srcsetFormatter(this.computedSrc, size, this)} ${size}w`
                }).join(',')
            }
            return undefined
        },
        computedSizes() {
            if (this.computedSrcset && this.computedWidth) {
                return `${this.computedWidth}px`
            }
            return undefined
        },
        isCaptionFirst() {
            return this.$slots.caption && this.captionFirst
        },
        isCaptionLast() {
            return this.$slots.caption && !this.captionFirst
        }
    },
    methods: {
        getExt(filename, clean = true) {
            if (filename) {
                const noParam = clean ? filename.split('?')[0] : filename;
                return noParam.split('.').pop()
            }
            return ''
        },
        setWidth() {
            this.clientWidth = this.$el.clientWidth;
        },
        formatSrcset(src, size) {
            const ext = this.getExt(src, false);
            const name = src.split('.').slice(0, -1).join('.');
            return `${name}-${size}.${ext}`
        },
        onLoad(event) {
            this.loaded = true;
            this.emit('load', event);
        },
        onError(event) {
            this.emit('error', event);
            if (!this.failed) {
                this.failed = true;
            }
        },
        emit(eventName, event) {
            const { target } = event;
            this.$emit(eventName, event, target.currentSrc || target.src || this.computedSrc);
        }
    },
    created() {
        if (this.isWepb) {
            isWebpSupported().then((supported) => {
                this.webpSupportVerified = true;
                this.webpSupported = supported;
            });
        }
        if (this.lazy) {
            // We use native lazy loading if supported
            // We try to use Intersection Observer if native lazy loading is not supported
            // We use the lazy attribute anyway if we cannot detect support (SSR for example).
            const nativeLazySupported = typeof window !== 'undefined' && 'HTMLImageElement' in window && 'loading' in HTMLImageElement.prototype;
            const intersectionObserverSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window;
            if (!nativeLazySupported && intersectionObserverSupported) {
                this.observer = new IntersectionObserver((events) => {
                    const { target, isIntersecting } = events[0];
                    if (isIntersecting && !this.inViewPort) {
                        this.inViewPort = true;
                        this.observer.unobserve(target);
                    }
                });
            } else {
                this.useNativeLazy = true;
            }
        }
    },
    mounted() {
        if (this.lazy && this.observer) {
            this.observer.observe(this.$el);
        }
        this.setWidth();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.setWidth);
        }
    },
    beforeUnmount() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.setWidth);
        }
    }
};

const _hoisted_1$N = { key: 0 };
const _hoisted_2$E = ["srcset", "src", "alt", "width", "sizes", "loading"];
const _hoisted_3$r = ["src", "alt"];
const _hoisted_4$j = { key: 1 };

function render$T(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("figure", {
    class: normalizeClass(["b-image-wrapper", $options.figureClasses]),
    style: normalizeStyle($options.figureStyles)
  }, [
    ($options.isCaptionFirst)
      ? (openBlock(), createElementBlock("figcaption", _hoisted_1$N, [
          renderSlot(_ctx.$slots, "caption")
        ]))
      : createCommentVNode("v-if", true),
    createVNode(Transition, { name: "fade" }, {
      default: withCtx(() => [
        ($options.isDisplayed)
          ? (openBlock(), createElementBlock("img", {
              key: 0,
              srcset: $options.computedSrcset,
              src: $options.computedSrc,
              alt: $props.alt,
              class: normalizeClass($options.imgClasses),
              width: $options.computedWidth,
              sizes: $options.computedSizes,
              loading: $options.computedNativeLazy,
              onLoad: _cache[0] || (_cache[0] = (...args) => ($options.onLoad && $options.onLoad(...args))),
              onError: _cache[1] || (_cache[1] = (...args) => ($options.onError && $options.onError(...args)))
            }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_2$E))
          : createCommentVNode("v-if", true)
      ]),
      _: 1 /* STABLE */
    }),
    createVNode(Transition, { name: "fade" }, {
      default: withCtx(() => [
        ($options.isPlaceholderDisplayed)
          ? renderSlot(_ctx.$slots, "placeholder", { key: 0 }, () => [
              createElementVNode("img", {
                src: $options.computedPlaceholder,
                alt: $props.alt,
                class: normalizeClass([$options.imgClasses, "placeholder"])
              }, null, 10 /* CLASS, PROPS */, _hoisted_3$r)
            ])
          : createCommentVNode("v-if", true)
      ]),
      _: 3 /* FORWARDED */
    }),
    ($options.isCaptionLast)
      ? (openBlock(), createElementBlock("figcaption", _hoisted_4$j, [
          renderSlot(_ctx.$slots, "caption")
        ]))
      : createCommentVNode("v-if", true)
  ], 6 /* CLASS, STYLE */))
}

script$$.render = render$T;
script$$.__file = "src/components/image/Image.vue";

var script$_ = {
    name: 'BCarouselList',
    components: {
        [script$17.name]: script$17,
        [script$$.name]: script$$
    },
    props: {
        data: {
            type: Array,
            default: () => []
        },
        modelValue: {
            type: Number,
            default: 0
        },
        scrollValue: {
            type: Number,
            default: 0
        },
        hasDrag: {
            type: Boolean,
            default: true
        },
        hasGrayscale: Boolean,
        hasOpacity: Boolean,
        repeat: Boolean,
        itemsToShow: {
            type: Number,
            default: 4
        },
        itemsToList: {
            type: Number,
            default: 1
        },
        asIndicator: Boolean,
        arrow: {
            type: Boolean,
            default: true
        },
        arrowHover: {
            type: Boolean,
            default: true
        },
        iconPack: String,
        iconSize: String,
        iconPrev: {
            type: String,
            default: () => {
                return config.defaultIconPrev
            }
        },
        iconNext: {
            type: String,
            default: () => {
                return config.defaultIconNext
            }
        },
        breakpoints: {
            type: Object,
            default: () => ({})
        }
    },
    emits: ['switch', 'update:modelValue', 'updated:scroll'],
    data() {
        return {
            activeItem: this.modelValue,
            scrollIndex: this.asIndicator ? this.scrollValue : this.modelValue,
            delta: 0,
            dragX: false,
            hold: 0,
            windowWidth: 0,
            touch: false,
            observer: null,
            refresh_: 0
        }
    },
    computed: {
        dragging() {
            return this.dragX !== false
        },
        listClass() {
            return [
                {
                    'has-grayscale': this.settings.hasGrayscale,
                    'has-opacity': this.settings.hasOpacity,
                    'is-dragging': this.dragging
                }
            ]
        },
        itemStyle() {
            return `width: ${this.itemWidth}px;`
        },
        translation() {
            return -bound(
                this.delta + (this.scrollIndex * this.itemWidth), 0,
                (this.data.length - this.settings.itemsToShow) * this.itemWidth
            )
        },
        total() {
            return this.data.length - this.settings.itemsToShow
        },
        hasPrev() {
            return (this.settings.repeat || this.scrollIndex > 0)
        },
        hasNext() {
            return (this.settings.repeat || this.scrollIndex < this.total)
        },
        breakpointKeys() {
            return Object.keys(this.breakpoints).sort((a, b) => b - a)
        },
        settings() {
            const breakpoint = this.breakpointKeys.filter((breakpoint) => {
                if (this.windowWidth >= breakpoint) {
                    return true
                } else {
                    return false
                }
            })[0];
            if (breakpoint) {
                return { ...this.$props, ...this.breakpoints[breakpoint] }
            }
            return this.$props
        },
        itemWidth() {
            if (this.windowWidth) { // Ensure component is mounted
                /* eslint-disable-next-line */
                this.refresh_; // We force the computed property to refresh if this prop is changed

                const rect = this.$el.getBoundingClientRect();
                return rect.width / this.settings.itemsToShow
            }
            return 0
        }
    },
    watch: {
        /**
         * When v-model is changed set the new active item.
         */
        modelValue(value) {
            this.switchTo(this.asIndicator ? value - (this.itemsToShow - 3) / 2 : value);
            if (this.activeItem !== value) {
                this.activeItem = bound(value, 0, this.data.length - 1);
            }
        },
        scrollValue(value) {
            this.switchTo(value);
        }
    },
    methods: {
        resized() {
            this.windowWidth = window.innerWidth;
        },
        switchTo(newIndex) {
            if (newIndex === this.scrollIndex || isNaN(newIndex)) { return }

            if (this.settings.repeat) {
                newIndex = mod(newIndex, this.total + 1);
            }
            newIndex = bound(newIndex, 0, this.total);
            this.scrollIndex = newIndex;
            if (!this.asIndicator && this.modelValue !== newIndex) {
                this.$emit('update:modelValue', newIndex);
            } else if (this.scrollIndex !== newIndex) {
                this.$emit('updated:scroll', newIndex);
            }
        },
        next() {
            this.switchTo(this.scrollIndex + this.settings.itemsToList);
        },
        prev() {
            this.switchTo(this.scrollIndex - this.settings.itemsToList);
        },
        checkAsIndicator(value, event) {
            if (!this.asIndicator) return

            const dragEndX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
            if (this.hold - Date.now() > 2000 || Math.abs(this.dragX - dragEndX) > 10) return

            this.dragX = false;
            this.hold = 0;
            event.preventDefault();

            // Make the item appear in the middle
            this.activeItem = value;

            this.$emit('switch', value);
        },
        // handle drag event
        dragStart(event) {
            if (this.dragging || !this.settings.hasDrag || (event.button !== 0 && event.type !== 'touchstart')) return
            this.hold = Date.now();
            this.touch = !!event.touches;
            this.dragX = this.touch ? event.touches[0].clientX : event.clientX;
            window.addEventListener(this.touch ? 'touchmove' : 'mousemove', this.dragMove);
            window.addEventListener(this.touch ? 'touchend' : 'mouseup', this.dragEnd);
        },
        dragMove(event) {
            if (!this.dragging) return
            const dragEndX = event.touches
                ? (event.changedTouches[0] || event.touches[0]).clientX
                : event.clientX;
            this.delta = this.dragX - dragEndX;
            if (!event.touches) {
                event.preventDefault();
            }
        },
        dragEnd() {
            if (!this.dragging && !this.hold) return
            if (this.hold) {
                const signCheck = sign(this.delta);
                const results = Math.round(Math.abs(this.delta / this.itemWidth) + 0.15);// Hack
                this.switchTo(this.scrollIndex + signCheck * results);
            }
            this.delta = 0;
            this.dragX = false;
            window.removeEventListener(this.touch ? 'touchmove' : 'mousemove', this.dragMove);
            window.removeEventListener(this.touch ? 'touchend' : 'mouseup', this.dragEnd);
        },
        refresh() {
            this.$nextTick(() => {
                this.refresh_++;
            });
        }
    },
    mounted() {
        if (typeof window !== 'undefined') {
            if (window.ResizeObserver) {
                this.observer = new ResizeObserver(this.refresh);
                this.observer.observe(this.$el);
            }
            window.addEventListener('resize', this.resized);
            document.addEventListener('animationend', this.refresh);
            document.addEventListener('transitionend', this.refresh);
            document.addEventListener('transitionstart', this.refresh);
            this.resized();
        }
        if (this.$attrs.config) {
            throw new Error('The config prop was removed, you need to use v-bind instead')
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            if (window.ResizeObserver) {
                this.observer.disconnect();
            }
            window.removeEventListener('resize', this.resized);
            document.removeEventListener('animationend', this.refresh);
            document.removeEventListener('transitionend', this.refresh);
            document.removeEventListener('transitionstart', this.refresh);
            this.dragEnd();
        }
    }
};

const _hoisted_1$M = ["onMouseup", "onTouchend"];

function render$S(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_image = resolveComponent("b-image");
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["carousel-list", {'has-shadow': $data.scrollIndex > 0}]),
    onMousedown: _cache[0] || (_cache[0] = withModifiers((...args) => ($options.dragStart && $options.dragStart(...args)), ["prevent"])),
    onTouchstart: _cache[1] || (_cache[1] = (...args) => ($options.dragStart && $options.dragStart(...args)))
  }, [
    createElementVNode("div", {
      class: normalizeClass(["carousel-slides", $options.listClass]),
      style: normalizeStyle('transform:translateX('+$options.translation+'px)')
    }, [
      (openBlock(true), createElementBlock(Fragment, null, renderList($props.data, (list, index) => {
        return (openBlock(), createElementBlock("div", {
          class: normalizeClass(["carousel-slide", {'is-active': $props.asIndicator ? $data.activeItem === index : $data.scrollIndex === index}]),
          onMouseup: $event => ($options.checkAsIndicator(index, $event)),
          onTouchend: $event => ($options.checkAsIndicator(index, $event)),
          key: index,
          style: normalizeStyle($options.itemStyle)
        }, [
          renderSlot(_ctx.$slots, "item", mergeProps({
            index: index,
            active: $data.activeItem,
            scroll: $data.scrollIndex
          }, list, { list: list }), () => [
            createVNode(_component_b_image, mergeProps({
              src: list.image
            }, list), null, 16 /* FULL_PROPS */, ["src"])
          ])
        ], 46 /* CLASS, STYLE, PROPS, HYDRATE_EVENTS */, _hoisted_1$M))
      }), 128 /* KEYED_FRAGMENT */))
    ], 6 /* CLASS, STYLE */),
    ($props.arrow)
      ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["carousel-arrow", {'is-hovered': $options.settings.arrowHover}])
        }, [
          withDirectives(createVNode(_component_b_icon, {
            class: "has-icons-left",
            onClick: withModifiers($options.prev, ["prevent"]),
            pack: $options.settings.iconPack,
            icon: $options.settings.iconPrev,
            size: $options.settings.iconSize,
            both: ""
          }, null, 8 /* PROPS */, ["onClick", "pack", "icon", "size"]), [
            [vShow, $options.hasPrev]
          ]),
          withDirectives(createVNode(_component_b_icon, {
            class: "has-icons-right",
            onClick: withModifiers($options.next, ["prevent"]),
            pack: $options.settings.iconPack,
            icon: $options.settings.iconNext,
            size: $options.settings.iconSize,
            both: ""
          }, null, 8 /* PROPS */, ["onClick", "pack", "icon", "size"]), [
            [vShow, $options.hasNext]
          ])
        ], 2 /* CLASS */))
      : createCommentVNode("v-if", true)
  ], 34 /* CLASS, HYDRATE_EVENTS */))
}

script$_.render = render$S;
script$_.__file = "src/components/carousel/CarouselList.vue";

var Plugin$1c = {
  install: function install(Vue) {
    registerComponent(Vue, script$11);
    registerComponent(Vue, script$10);
    registerComponent(Vue, script$_);
  }
};
use(Plugin$1c);
var Plugin$1d = Plugin$1c;

var CheckRadioMixin = {
  props: {
    modelValue: [String, Number, Boolean, Function, Object, Array],
    nativeValue: [String, Number, Boolean, Function, Object, Array],
    type: String,
    disabled: Boolean,
    required: Boolean,
    name: String,
    size: String
  },
  emits: ['update:modelValue'],
  data: function data() {
    return {
      newValue: this.modelValue
    };
  },
  computed: {
    computedValue: {
      get: function get() {
        return this.newValue;
      },
      set: function set(value) {
        this.newValue = value;
        this.$emit('update:modelValue', value);
      }
    },
    disabledOrUndefined: function disabledOrUndefined() {
      // On Vue 3, setting a boolean attribute `false` does not remove it.
      // To remove it, `null` or `undefined` has to be given.
      // Setting `false` ends up with a grayed out component.
      return this.disabled || undefined;
    },
    requiredOrUndefined: function requiredOrUndefined() {
      // On Vue 3, setting a boolean attribute `false` does not remove it,
      // `null` or `undefined` has to be given to remove it.
      return this.required || undefined;
    }
  },
  watch: {
    /**
    * When v-model change, set internal value.
    */
    modelValue: function modelValue(value) {
      this.newValue = value;
    }
  },
  methods: {
    focus: function focus() {
      // MacOS FireFox and Safari do not focus when clicked
      this.$refs.input.focus();
    }
  }
};

var script$Z = {
    name: 'BCheckbox',
    mixins: [CheckRadioMixin],
    props: {
        indeterminate: Boolean,
        ariaLabelledby: String,
        trueValue: {
            type: [String, Number, Boolean, Function, Object, Array],
            default: true
        },
        falseValue: {
            type: [String, Number, Boolean, Function, Object, Array],
            default: false
        },
        autocomplete: {
            type: String,
            default: 'on'
        },
        inputId: {
            type: String,
            default: ''
        }
    }
};

const _hoisted_1$L = ["disabled"];
const _hoisted_2$D = ["id", ".indeterminate", "autocomplete", "disabled", "required", "name", "value", "true-value", "false-value", "aria-labelledby"];
const _hoisted_3$q = ["id"];

function render$R(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("label", {
    class: normalizeClass(["b-checkbox checkbox", [_ctx.size, { 'is-disabled': _ctx.disabled }]]),
    ref: "label",
    disabled: _ctx.disabledOrUndefined,
    onClick: _cache[2] || (_cache[2] = (...args) => (_ctx.focus && _ctx.focus(...args))),
    onKeydown: [
      _cache[3] || (_cache[3] = withKeys(withModifiers($event => (_ctx.$refs.label.click()), ["prevent"]), ["enter"])),
      _cache[4] || (_cache[4] = withKeys(withModifiers($event => (_ctx.$refs.label.click()), ["prevent"]), ["space"]))
    ]
  }, [
    createCommentVNode(" Checkbox needs to listen for a space event instead of a just a\n             click and enter event so that that using the keyboard spacebar will also\n             trigger the checkbox change in the b-table "),
    withDirectives(createElementVNode("input", {
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.computedValue) = $event)),
      id: $props.inputId,
      ".indeterminate": $props.indeterminate,
      type: "checkbox",
      ref: "input",
      onClick: _cache[1] || (_cache[1] = withModifiers(() => {}, ["stop"])),
      autocomplete: $props.autocomplete,
      disabled: _ctx.disabledOrUndefined,
      required: _ctx.requiredOrUndefined,
      name: _ctx.name,
      value: _ctx.nativeValue,
      "true-value": $props.trueValue,
      "false-value": $props.falseValue,
      "aria-labelledby": $props.ariaLabelledby
    }, null, 8 /* PROPS */, _hoisted_2$D), [
      [vModelCheckbox, _ctx.computedValue]
    ]),
    createElementVNode("span", {
      class: normalizeClass(["check", _ctx.type])
    }, null, 2 /* CLASS */),
    createElementVNode("span", {
      id: $props.ariaLabelledby,
      class: "control-label"
    }, [
      renderSlot(_ctx.$slots, "default")
    ], 8 /* PROPS */, _hoisted_3$q)
  ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$L))
}

script$Z.render = render$R;
script$Z.__file = "src/components/checkbox/Checkbox.vue";

var script$Y = {
    name: 'BCheckboxButton',
    mixins: [CheckRadioMixin],
    props: {
        type: {
            type: String,
            default: 'is-primary'
        },
        expanded: Boolean
    },
    data() {
        return {
            isFocused: false
        }
    },
    computed: {
        checked() {
            if (Array.isArray(this.newValue)) {
                return this.newValue.indexOf(this.nativeValue) >= 0
            }
            return this.newValue === this.nativeValue
        }
    }
};

const _hoisted_1$K = ["disabled"];
const _hoisted_2$C = ["disabled", "required", "name", "value"];

function render$Q(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["control", { 'is-expanded': $props.expanded }])
  }, [
    createElementVNode("label", {
      class: normalizeClass(["b-checkbox checkbox button", [$options.checked ? $props.type : null, _ctx.size, {
                'is-disabled': _ctx.disabled,
                'is-focused': $data.isFocused
            }]]),
      ref: "label",
      disabled: _ctx.disabledOrUndefined,
      onClick: _cache[4] || (_cache[4] = (...args) => (_ctx.focus && _ctx.focus(...args))),
      onKeydown: _cache[5] || (_cache[5] = withKeys(withModifiers($event => (_ctx.$refs.label.click()), ["prevent"]), ["enter"]))
    }, [
      renderSlot(_ctx.$slots, "default"),
      withDirectives(createElementVNode("input", {
        "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.computedValue) = $event)),
        type: "checkbox",
        ref: "input",
        onClick: _cache[1] || (_cache[1] = withModifiers(() => {}, ["stop"])),
        disabled: _ctx.disabledOrUndefined,
        required: _ctx.requiredOrUndefined,
        name: _ctx.name,
        value: _ctx.nativeValue,
        onFocus: _cache[2] || (_cache[2] = $event => ($data.isFocused = true)),
        onBlur: _cache[3] || (_cache[3] = $event => ($data.isFocused = false))
      }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_2$C), [
        [vModelCheckbox, _ctx.computedValue]
      ])
    ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$K)
  ], 2 /* CLASS */))
}

script$Y.render = render$Q;
script$Y.__file = "src/components/checkbox/CheckboxButton.vue";

var Plugin$1a = {
  install: function install(Vue) {
    registerComponent(Vue, script$Z);
    registerComponent(Vue, script$Y);
  }
};
use(Plugin$1a);
var Plugin$1b = Plugin$1a;

var script$X = {
    name: 'BCollapse',
    props: {
        modelValue: {
            type: Boolean,
            default: true
        },
        animation: {
            type: String,
            default: 'fade'
        },
        ariaId: {
            type: String,
            default: ''
        },
        position: {
            type: String,
            default: 'is-top',
            validator(value) {
                return [
                    'is-top',
                    'is-bottom'
                ].indexOf(value) > -1
            }
        }
    },
    emits: ['close', 'open', 'update:modelValue'],
    data() {
        return {
            isOpen: this.modelValue
        }
    },
    watch: {
        modelValue(value) {
            this.isOpen = value;
        }
    },
    methods: {
        /**
        * Toggle and emit events
        */
        toggle() {
            this.isOpen = !this.isOpen;
            this.$emit('update:modelValue', this.isOpen);
            this.$emit(this.isOpen ? 'open' : 'close');
        }
    },
    render() {
        const trigger = h(
            'div',
            {
                class: 'collapse-trigger',
                onClick: this.toggle
            },
            {
                default: () => {
                    return this.$slots.trigger
                        ? this.$slots.trigger({ open: this.isOpen })
                        : undefined
                }
            }
        );
        const content = withDirectives(
            h(
                Transition,
                { name: this.animation },
                [
                    h(
                        'div',
                        {
                            class: 'collapse-content',
                            id: this.ariaId
                        },
                        this.$slots
                    )
                ]
            ),
            [[vShow, this.isOpen]]
        );
        return h(
            'div',
            { class: 'collapse' },
            {
                default: () => {
                    return this.position === 'is-top'
                        ? [trigger, content]
                        : [content, trigger]
                }
            }
        )
    }
};

script$X.__file = "src/components/collapse/Collapse.vue";

var Plugin$18 = {
  install: function install(Vue) {
    registerComponent(Vue, script$X);
  }
};
use(Plugin$18);
var Plugin$19 = Plugin$18;

var AM$1 = 'AM';
var PM$1 = 'PM';
var HOUR_FORMAT_24 = '24';
var HOUR_FORMAT_12 = '12';
var defaultTimeFormatter = function defaultTimeFormatter(date, vm) {
  return vm.dtf.format(date);
};
var defaultTimeParser = function defaultTimeParser(timeString, vm) {
  if (timeString) {
    var d = null;
    if (vm.computedValue && !isNaN(vm.computedValue)) {
      d = new Date(vm.computedValue);
    } else {
      d = vm.timeCreator();
      d.setMilliseconds(0);
    }
    if (vm.dtf.formatToParts && typeof vm.dtf.formatToParts === 'function') {
      var formatRegex = vm.dtf.formatToParts(d).map(function (part) {
        if (part.type === 'literal') {
          return part.value.replace(/ /g, '\\s?');
        } else if (part.type === 'dayPeriod') {
          return "((?!=<".concat(part.type, ">)(").concat(vm.amString, "|").concat(vm.pmString, "|").concat(AM$1, "|").concat(PM$1, "|").concat(AM$1.toLowerCase(), "|").concat(PM$1.toLowerCase(), ")?)");
        }
        return "((?!=<".concat(part.type, ">)\\d+)");
      }).join('');
      var timeGroups = matchWithGroups(formatRegex, timeString);

      // We do a simple validation for the group.
      // If it is not valid, it will fallback to Date.parse below
      timeGroups.hour = timeGroups.hour ? parseInt(timeGroups.hour, 10) : null;
      timeGroups.minute = timeGroups.minute ? parseInt(timeGroups.minute, 10) : null;
      timeGroups.second = timeGroups.second ? parseInt(timeGroups.second, 10) : null;
      if (timeGroups.hour && timeGroups.hour >= 0 && timeGroups.hour < 24 && timeGroups.minute && timeGroups.minute >= 0 && timeGroups.minute < 59) {
        if (timeGroups.dayPeriod && (timeGroups.dayPeriod.toLowerCase() === vm.pmString.toLowerCase() || timeGroups.dayPeriod.toLowerCase() === PM$1.toLowerCase()) && timeGroups.hour < 12) {
          timeGroups.hour += 12;
        }
        d.setHours(timeGroups.hour);
        d.setMinutes(timeGroups.minute);
        d.setSeconds(timeGroups.second || 0);
        return d;
      }
    }

    // Fallback if formatToParts is not supported or if we were not able to parse a valid date
    var am = false;
    if (vm.hourFormat === HOUR_FORMAT_12) {
      var dateString12 = timeString.split(' ');
      timeString = dateString12[0];
      am = dateString12[1] === vm.amString || dateString12[1] === AM$1;
    }
    var time = timeString.split(':');
    var hours = parseInt(time[0], 10);
    var minutes = parseInt(time[1], 10);
    var seconds = vm.enableSeconds ? parseInt(time[2], 10) : 0;
    if (isNaN(hours) || hours < 0 || hours > 23 || vm.hourFormat === HOUR_FORMAT_12 && (hours < 1 || hours > 12) || isNaN(minutes) || minutes < 0 || minutes > 59) {
      return null;
    }
    d.setSeconds(seconds);
    d.setMinutes(minutes);
    if (vm.hourFormat === HOUR_FORMAT_12) {
      if (am && hours === 12) {
        hours = 0;
      } else if (!am && hours !== 12) {
        hours += 12;
      }
    }
    d.setHours(hours);
    return new Date(d.getTime());
  }
  return null;
};
var TimepickerMixin = {
  mixins: [FormElementMixin],
  inheritAttrs: false,
  props: {
    modelValue: Date,
    inline: Boolean,
    minTime: Date,
    maxTime: Date,
    placeholder: String,
    editable: Boolean,
    disabled: Boolean,
    hourFormat: {
      type: String,
      validator: function validator(value) {
        return value === HOUR_FORMAT_24 || value === HOUR_FORMAT_12;
      }
    },
    incrementHours: {
      type: Number,
      default: 1
    },
    incrementMinutes: {
      type: Number,
      default: 1
    },
    incrementSeconds: {
      type: Number,
      default: 1
    },
    timeFormatter: {
      type: Function,
      default: function _default(date, vm) {
        if (typeof config.defaultTimeFormatter === 'function') {
          return config.defaultTimeFormatter(date);
        } else {
          return defaultTimeFormatter(date, vm);
        }
      }
    },
    timeParser: {
      type: Function,
      default: function _default(date, vm) {
        if (typeof config.defaultTimeParser === 'function') {
          return config.defaultTimeParser(date);
        } else {
          return defaultTimeParser(date, vm);
        }
      }
    },
    mobileNative: {
      type: Boolean,
      default: function _default() {
        return config.defaultTimepickerMobileNative;
      }
    },
    mobileModal: {
      type: Boolean,
      default: function _default() {
        return config.defaultTimepickerMobileModal;
      }
    },
    timeCreator: {
      type: Function,
      default: function _default() {
        if (typeof config.defaultTimeCreator === 'function') {
          return config.defaultTimeCreator();
        } else {
          return new Date();
        }
      }
    },
    position: String,
    unselectableTimes: Array,
    openOnFocus: Boolean,
    enableSeconds: Boolean,
    defaultMinutes: Number,
    defaultSeconds: Number,
    focusable: {
      type: Boolean,
      default: true
    },
    tzOffset: {
      type: Number,
      default: 0
    },
    appendToBody: Boolean,
    resetOnMeridianChange: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data: function data() {
    return {
      dateSelected: this.modelValue,
      hoursSelected: null,
      minutesSelected: null,
      secondsSelected: null,
      meridienSelected: null,
      _elementRef: 'input',
      AM: AM$1,
      PM: PM$1,
      HOUR_FORMAT_24: HOUR_FORMAT_24,
      HOUR_FORMAT_12: HOUR_FORMAT_12
    };
  },
  computed: {
    computedValue: {
      get: function get() {
        return this.dateSelected;
      },
      set: function set(value) {
        this.dateSelected = value;
        this.$emit('update:modelValue', this.dateSelected);
      }
    },
    localeOptions: function localeOptions() {
      return new Intl.DateTimeFormat(this.locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: this.enableSeconds ? 'numeric' : undefined
      }).resolvedOptions();
    },
    dtf: function dtf() {
      return new Intl.DateTimeFormat(this.locale, {
        hour: this.localeOptions.hour || 'numeric',
        minute: this.localeOptions.minute || 'numeric',
        second: this.enableSeconds ? this.localeOptions.second || 'numeric' : undefined,
        // Fixes 12 hour display github.com/buefy/buefy/issues/3418
        hourCycle: !this.isHourFormat24 ? 'h12' : 'h23'
      });
    },
    newHourFormat: function newHourFormat() {
      return this.hourFormat || (this.localeOptions.hour12 ? HOUR_FORMAT_12 : HOUR_FORMAT_24);
    },
    sampleTime: function sampleTime() {
      var d = this.timeCreator();
      d.setHours(10);
      d.setSeconds(0);
      d.setMinutes(0);
      d.setMilliseconds(0);
      return d;
    },
    hourLiteral: function hourLiteral() {
      if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
        var d = this.sampleTime;
        var parts = this.dtf.formatToParts(d);
        var literal = parts.find(function (part, idx) {
          return idx > 0 && parts[idx - 1].type === 'hour';
        });
        if (literal) {
          return literal.value;
        }
      }
      return ':';
    },
    minuteLiteral: function minuteLiteral() {
      if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
        var d = this.sampleTime;
        var parts = this.dtf.formatToParts(d);
        var literal = parts.find(function (part, idx) {
          return idx > 0 && parts[idx - 1].type === 'minute';
        });
        if (literal) {
          return literal.value;
        }
      }
      return ':';
    },
    secondLiteral: function secondLiteral() {
      if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
        var d = this.sampleTime;
        var parts = this.dtf.formatToParts(d);
        var literal = parts.find(function (part, idx) {
          return idx > 0 && parts[idx - 1].type === 'second';
        });
        if (literal) {
          return literal.value;
        }
      }
    },
    amString: function amString() {
      if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
        var d = this.sampleTime;
        d.setHours(10);
        var dayPeriod = this.dtf.formatToParts(d).find(function (part) {
          return part.type === 'dayPeriod';
        });
        if (dayPeriod) {
          return dayPeriod.value;
        }
      }
      return AM$1;
    },
    pmString: function pmString() {
      if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
        var d = this.sampleTime;
        d.setHours(20);
        var dayPeriod = this.dtf.formatToParts(d).find(function (part) {
          return part.type === 'dayPeriod';
        });
        if (dayPeriod) {
          return dayPeriod.value;
        }
      }
      return PM$1;
    },
    hours: function hours() {
      if (!this.incrementHours || this.incrementHours < 1) throw new Error('Hour increment cannot be null or less than 1.');
      var hours = [];
      var numberOfHours = this.isHourFormat24 ? 24 : 12;
      for (var i = 0; i < numberOfHours; i += this.incrementHours) {
        var value = i;
        var label = value;
        if (!this.isHourFormat24) {
          value = i + 1;
          label = value;
          if (this.meridienSelected === this.amString) {
            if (value === 12) {
              value = 0;
            }
          } else if (this.meridienSelected === this.pmString) {
            if (value !== 12) {
              value += 12;
            }
          }
        }
        hours.push({
          label: this.formatNumber(label),
          value: value
        });
      }
      return hours;
    },
    minutes: function minutes() {
      if (!this.incrementMinutes || this.incrementMinutes < 1) throw new Error('Minute increment cannot be null or less than 1.');
      var minutes = [];
      for (var i = 0; i < 60; i += this.incrementMinutes) {
        minutes.push({
          label: this.formatNumber(i, true),
          value: i
        });
      }
      return minutes;
    },
    seconds: function seconds() {
      if (!this.incrementSeconds || this.incrementSeconds < 1) throw new Error('Second increment cannot be null or less than 1.');
      var seconds = [];
      for (var i = 0; i < 60; i += this.incrementSeconds) {
        seconds.push({
          label: this.formatNumber(i, true),
          value: i
        });
      }
      return seconds;
    },
    meridiens: function meridiens() {
      return [this.amString, this.pmString];
    },
    isMobile: function isMobile$1() {
      return this.mobileNative && isMobile.any();
    },
    isHourFormat24: function isHourFormat24() {
      return this.newHourFormat === HOUR_FORMAT_24;
    },
    disabledOrUndefined: function disabledOrUndefined() {
      return this.disabled || undefined;
    }
  },
  watch: {
    hourFormat: function hourFormat() {
      if (this.hoursSelected !== null) {
        this.meridienSelected = this.hoursSelected >= 12 ? this.pmString : this.amString;
      }
    },
    locale: function locale() {
      // see updateInternalState default
      if (!this.value) {
        this.meridienSelected = this.amString;
      }
    },
    /**
     * When v-model is changed:
     *   1. Update internal value.
     *   2. If it's invalid, validate again.
     */
    modelValue: {
      handler: function handler(value) {
        this.updateInternalState(value);
        !this.isValid && this.$refs.input.checkHtml5Validity();
      },
      immediate: true
    }
  },
  methods: {
    onMeridienChange: function onMeridienChange(value) {
      if (this.hoursSelected !== null && this.resetOnMeridianChange) {
        this.hoursSelected = null;
        this.minutesSelected = null;
        this.secondsSelected = null;
        this.computedValue = null;
      } else if (this.hoursSelected !== null) {
        if (value === this.pmString) {
          this.hoursSelected += 12;
        } else if (value === this.amString) {
          this.hoursSelected -= 12;
        }
      }
      this.updateDateSelected(this.hoursSelected, this.minutesSelected, this.enableSeconds ? this.secondsSelected : 0, value);
    },
    onHoursChange: function onHoursChange(value) {
      if (!this.minutesSelected && typeof this.defaultMinutes !== 'undefined') {
        this.minutesSelected = this.defaultMinutes;
      }
      if (!this.secondsSelected && typeof this.defaultSeconds !== 'undefined') {
        this.secondsSelected = this.defaultSeconds;
      }
      this.updateDateSelected(parseInt(value, 10), this.minutesSelected, this.enableSeconds ? this.secondsSelected : 0, this.meridienSelected);
    },
    onMinutesChange: function onMinutesChange(value) {
      if (!this.secondsSelected && this.defaultSeconds) {
        this.secondsSelected = this.defaultSeconds;
      }
      this.updateDateSelected(this.hoursSelected, parseInt(value, 10), this.enableSeconds ? this.secondsSelected : 0, this.meridienSelected);
    },
    onSecondsChange: function onSecondsChange(value) {
      this.updateDateSelected(this.hoursSelected, this.minutesSelected, parseInt(value, 10), this.meridienSelected);
    },
    updateDateSelected: function updateDateSelected(hours, minutes, seconds, meridiens) {
      if (hours != null && minutes != null && (!this.isHourFormat24 && meridiens !== null || this.isHourFormat24)) {
        var time = null;
        if (this.computedValue && !isNaN(this.computedValue)) {
          time = new Date(this.computedValue);
        } else {
          time = this.timeCreator();
          time.setMilliseconds(0);
        }
        time.setHours(hours);
        time.setMinutes(minutes);
        time.setSeconds(seconds);
        if (!isNaN(time.getTime())) this.computedValue = new Date(time.getTime());
      }
    },
    updateInternalState: function updateInternalState(value) {
      if (value) {
        this.hoursSelected = value.getHours();
        this.minutesSelected = value.getMinutes();
        this.secondsSelected = value.getSeconds();
        this.meridienSelected = value.getHours() >= 12 ? this.pmString : this.amString;
      } else {
        this.hoursSelected = null;
        this.minutesSelected = null;
        this.secondsSelected = null;
        this.meridienSelected = this.amString;
      }
      this.dateSelected = value;
    },
    isHourDisabled: function isHourDisabled(hour) {
      var _this = this;
      var disabled = false;
      if (this.minTime) {
        var minHours = this.minTime.getHours();
        var noMinutesAvailable = this.minutes.every(function (minute) {
          return _this.isMinuteDisabledForHour(hour, minute.value);
        });
        disabled = hour < minHours || noMinutesAvailable;
      }
      if (this.maxTime) {
        if (!disabled) {
          var maxHours = this.maxTime.getHours();
          disabled = hour > maxHours;
        }
      }
      if (this.unselectableTimes) {
        if (!disabled) {
          var unselectable = this.unselectableTimes.filter(function (time) {
            if (_this.enableSeconds && _this.secondsSelected !== null) {
              return time.getHours() === hour && time.getMinutes() === _this.minutesSelected && time.getSeconds() === _this.secondsSelected;
            } else if (_this.minutesSelected !== null) {
              return time.getHours() === hour && time.getMinutes() === _this.minutesSelected;
            }
            return false;
          });
          if (unselectable.length > 0) {
            disabled = true;
          } else {
            disabled = this.minutes.every(function (minute) {
              return _this.unselectableTimes.filter(function (time) {
                return time.getHours() === hour && time.getMinutes() === minute.value;
              }).length > 0;
            });
          }
        }
      }
      return disabled;
    },
    isMinuteDisabledForHour: function isMinuteDisabledForHour(hour, minute) {
      var disabled = false;
      if (this.minTime) {
        var minHours = this.minTime.getHours();
        var minMinutes = this.minTime.getMinutes();
        disabled = hour === minHours && minute < minMinutes;
      }
      if (this.maxTime) {
        if (!disabled) {
          var maxHours = this.maxTime.getHours();
          var maxMinutes = this.maxTime.getMinutes();
          disabled = hour === maxHours && minute > maxMinutes;
        }
      }
      return disabled;
    },
    isMinuteDisabled: function isMinuteDisabled(minute) {
      var _this2 = this;
      var disabled = false;
      if (this.hoursSelected !== null) {
        if (this.isHourDisabled(this.hoursSelected)) {
          disabled = true;
        } else {
          disabled = this.isMinuteDisabledForHour(this.hoursSelected, minute);
        }
        if (this.unselectableTimes) {
          if (!disabled) {
            var unselectable = this.unselectableTimes.filter(function (time) {
              if (_this2.enableSeconds && _this2.secondsSelected !== null) {
                return time.getHours() === _this2.hoursSelected && time.getMinutes() === minute && time.getSeconds() === _this2.secondsSelected;
              } else {
                return time.getHours() === _this2.hoursSelected && time.getMinutes() === minute;
              }
            });
            disabled = unselectable.length > 0;
          }
        }
      }
      return disabled;
    },
    isSecondDisabled: function isSecondDisabled(second) {
      var _this3 = this;
      var disabled = false;
      if (this.minutesSelected !== null) {
        if (this.isMinuteDisabled(this.minutesSelected)) {
          disabled = true;
        } else {
          if (this.minTime) {
            var minHours = this.minTime.getHours();
            var minMinutes = this.minTime.getMinutes();
            var minSeconds = this.minTime.getSeconds();
            disabled = this.hoursSelected === minHours && this.minutesSelected === minMinutes && second < minSeconds;
          }
          if (this.maxTime) {
            if (!disabled) {
              var maxHours = this.maxTime.getHours();
              var maxMinutes = this.maxTime.getMinutes();
              var maxSeconds = this.maxTime.getSeconds();
              disabled = this.hoursSelected === maxHours && this.minutesSelected === maxMinutes && second > maxSeconds;
            }
          }
        }
        if (this.unselectableTimes) {
          if (!disabled) {
            var unselectable = this.unselectableTimes.filter(function (time) {
              return time.getHours() === _this3.hoursSelected && time.getMinutes() === _this3.minutesSelected && time.getSeconds() === second;
            });
            disabled = unselectable.length > 0;
          }
        }
      }
      return disabled;
    },
    /*
     * Parse string into date
     */
    onChange: function onChange(value) {
      var date = this.timeParser(value, this);
      this.updateInternalState(date);
      if (date && !isNaN(date)) {
        this.computedValue = date;
      } else {
        // Force refresh input value when not valid date
        this.computedValue = null;
        this.$refs.input.newValue = this.computedValue;
      }
    },
    /*
     * Toggle timepicker
     */
    toggle: function toggle(active) {
      if (this.$refs.dropdown) {
        this.$refs.dropdown.isActive = typeof active === 'boolean' ? active : !this.$refs.dropdown.isActive;
      }
    },
    /*
     * Close timepicker
     */
    close: function close() {
      this.toggle(false);
    },
    /*
     * Call default onFocus method and show timepicker
     */
    handleOnFocus: function handleOnFocus() {
      this.onFocus();
      if (this.openOnFocus) {
        this.toggle(true);
      }
    },
    /*
     * Format date into string 'HH-MM-SS'
     */
    formatHHMMSS: function formatHHMMSS(value) {
      var date = new Date(value);
      if (value && !isNaN(date)) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        return this.formatNumber(hours, true) + ':' + this.formatNumber(minutes, true) + ':' + this.formatNumber(seconds, true);
      }
      return '';
    },
    /*
     * Parse time from string
     */
    onChangeNativePicker: function onChangeNativePicker(event) {
      var date = event.target.value;
      if (date) {
        var time = null;
        if (this.computedValue && !isNaN(this.computedValue)) {
          time = new Date(this.computedValue);
        } else {
          time = new Date();
          time.setMilliseconds(0);
        }
        var t = date.split(':');
        time.setHours(parseInt(t[0], 10));
        time.setMinutes(parseInt(t[1], 10));
        time.setSeconds(t[2] ? parseInt(t[2], 10) : 0);
        this.computedValue = new Date(time.getTime());
      } else {
        this.computedValue = null;
      }
    },
    formatNumber: function formatNumber(value, prependZero) {
      return this.isHourFormat24 || prependZero ? this.pad(value) : value;
    },
    pad: function pad(value) {
      return (value < 10 ? '0' : '') + value;
    },
    /*
     * Format date into string
     */
    formatValue: function formatValue(date) {
      if (date && !isNaN(date)) {
        return this.timeFormatter(date, this);
      } else {
        return null;
      }
    },
    /**
     * Keypress event that is bound to the document.
     */
    keyPress: function keyPress(_ref) {
      var key = _ref.key;
      if (this.$refs.dropdown && this.$refs.dropdown.isActive && (key === 'Escape' || key === 'Esc')) {
        this.toggle(false);
      }
    },
    /**
     * Emit 'blur' event on dropdown is not active (closed)
     */
    onActiveChange: function onActiveChange(value) {
      if (!value) {
        this.onBlur();
      }
    }
  },
  created: function created() {
    if (typeof window !== 'undefined') {
      document.addEventListener('keyup', this.keyPress);
    }
  },
  beforeUnmounted: function beforeUnmounted() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('keyup', this.keyPress);
    }
  }
};

var findFocusable = function findFocusable(element) {
  var programmatic = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!element) {
    return null;
  }
  if (programmatic) {
    return element.querySelectorAll('*[tabindex="-1"]');
  }
  return element.querySelectorAll("a[href]:not([tabindex=\"-1\"]),\n                                     area[href],\n                                     input:not([disabled]),\n                                     select:not([disabled]),\n                                     textarea:not([disabled]),\n                                     button:not([disabled]),\n                                     iframe,\n                                     object,\n                                     embed,\n                                     *[tabindex]:not([tabindex=\"-1\"]),\n                                     *[contenteditable]");
};
var onKeyDown;
var beforeMount$1 = function beforeMount(el, _ref) {
  var _ref$value = _ref.value,
    value = _ref$value === void 0 ? true : _ref$value;
  if (value) {
    var focusable = findFocusable(el);
    var focusableProg = findFocusable(el, true);
    if (focusable && focusable.length > 0) {
      onKeyDown = function onKeyDown(event) {
        // Need to get focusable each time since it can change between key events
        // ex. changing month in a datepicker
        focusable = findFocusable(el);
        focusableProg = findFocusable(el, true);
        var firstFocusable = focusable[0];
        var lastFocusable = focusable[focusable.length - 1];
        if (event.target === firstFocusable && event.shiftKey && event.key === 'Tab') {
          event.preventDefault();
          lastFocusable.focus();
        } else if ((event.target === lastFocusable || Array.from(focusableProg).indexOf(event.target) >= 0) && !event.shiftKey && event.key === 'Tab') {
          event.preventDefault();
          firstFocusable.focus();
        }
      };
      el.addEventListener('keydown', onKeyDown);
    }
  }
};
var unmounted$1 = function unmounted(el) {
  el.removeEventListener('keydown', onKeyDown);
};
var directive$1 = {
  beforeMount: beforeMount$1,
  unmounted: unmounted$1
};
var trapFocus = directive$1;

const DEFAULT_CLOSE_OPTIONS = ['escape', 'outside'];

var script$W = {
    name: 'BDropdown',
    directives: {
        trapFocus
    },
    mixins: [ProviderParentMixin('dropdown')],
    props: {
        modelValue: {
            type: [String, Number, Boolean, Object, Array, Function],
            default: null
        },
        disabled: Boolean,
        inline: Boolean,
        scrollable: Boolean,
        maxHeight: {
            type: [String, Number],
            default: 200
        },
        position: {
            type: String,
            validator(value) {
                return [
                    'is-top-right',
                    'is-top-left',
                    'is-bottom-left',
                    'is-bottom-right'
                ].indexOf(value) > -1
            }
        },
        triggers: {
            type: Array,
            default: () => ['click']
        },
        mobileModal: {
            type: Boolean,
            default: () => {
                return config.defaultDropdownMobileModal
            }
        },
        ariaRole: {
            type: String,
            validator(value) {
                return [
                    'menu',
                    'list',
                    'dialog'
                ].indexOf(value) > -1
            },
            default: null
        },
        animation: {
            type: String,
            default: 'fade'
        },
        multiple: Boolean,
        trapFocus: {
            type: Boolean,
            default: () => {
                return config.defaultTrapFocus
            }
        },
        closeOnClick: {
            type: Boolean,
            default: true
        },
        canClose: {
            type: [Array, Boolean],
            default: true
        },
        expanded: Boolean,
        appendToBody: Boolean,
        appendToBodyCopyParent: Boolean,
        triggerTabindex: {
            type: Number,
            default: 0
        }
    },
    emits: ['active-change', 'change', 'update:modelValue'],
    data() {
        return {
            selected: this.modelValue,
            style: {},
            isActive: false,
            isHoverable: false,
            _bodyEl: undefined // Used to append to body
        }
    },
    computed: {
        rootClasses() {
            return [this.position, {
                'is-disabled': this.disabled,
                'is-hoverable': this.hoverable,
                'is-inline': this.inline,
                'is-active': this.isActive || this.inline,
                'is-mobile-modal': this.isMobileModal,
                'is-expanded': this.expanded
            }]
        },
        isMobileModal() {
            return this.mobileModal && !this.inline
        },
        cancelOptions() {
            return typeof this.canClose === 'boolean'
                ? this.canClose
                    ? DEFAULT_CLOSE_OPTIONS
                    : []
                : this.canClose
        },
        contentStyle() {
            return {
                maxHeight: this.scrollable ? toCssWidth(this.maxHeight) : null,
                overflow: this.scrollable ? 'auto' : null
            }
        },
        hoverable() {
            return this.triggers.indexOf('hover') >= 0
        }
    },
    watch: {
        /**
        * When v-model is changed set the new selected item.
        */
        modelValue(value) {
            this.selected = value;
        },

        /**
        * Emit event when isActive value is changed.
        */
        isActive(value) {
            this.$emit('active-change', value);
            this.handleScroll();
            if (this.appendToBody) {
                this.$nextTick(() => {
                    this.updateAppendToBody();
                });
            }
        },

        isHoverable(value) {
            if (this.hoverable) {
                this.$emit('active-change', value);
            }
        }
    },
    methods: {
        handleScroll() {
            if (typeof window === 'undefined') return

            if (this.isMobileModal) {
                if (this.isActive) {
                    document.documentElement.classList.add('is-clipped-touch');
                } else {
                    document.documentElement.classList.remove('is-clipped-touch');
                }
            }
        },

        /**
         * Click listener from DropdownItem.
         *   1. Set new selected item.
         *   2. Emit input event to update the user v-model.
         *   3. Close the dropdown.
         */
        selectItem(value) {
            if (this.multiple) {
                if (this.selected) {
                    if (this.selected.indexOf(value) === -1) {
                        // Add value
                        this.selected = [...this.selected, value];
                    } else {
                        // Remove value
                        this.selected = this.selected.filter((val) => val !== value);
                    }
                } else {
                    this.selected = [value];
                }
                this.$emit('change', this.selected);
            } else {
                if (this.selected !== value) {
                    this.selected = value;
                    this.$emit('change', this.selected);
                }
            }
            this.$emit('update:modelValue', this.selected);
            if (!this.multiple) {
                this.isActive = !this.closeOnClick;
                if (this.hoverable && this.closeOnClick) {
                    this.isHoverable = false;
                }
            }
        },

        /**
        * White-listed items to not close when clicked.
        */
        isInWhiteList(el) {
            if (el === this.$refs.dropdownMenu) return true
            if (el === this.$refs.trigger) return true
            // All chidren from dropdown
            if (this.$refs.dropdownMenu !== undefined) {
                const children = this.$refs.dropdownMenu.querySelectorAll('*');
                for (const child of children) {
                    if (el === child) {
                        return true
                    }
                }
            }
            // All children from trigger
            if (this.$refs.trigger !== undefined) {
                const children = this.$refs.trigger.querySelectorAll('*');
                for (const child of children) {
                    if (el === child) {
                        return true
                    }
                }
            }
            return false
        },

        /**
        * Close dropdown if clicked outside.
        */
        clickedOutside(event) {
            if (this.cancelOptions.indexOf('outside') < 0) return
            if (this.inline) return

            const target = isCustomElement(this) ? event.composedPath()[0] : event.target;
            if (!this.isInWhiteList(target)) this.isActive = false;
        },

        /**
         * Keypress event that is bound to the document
         */
        keyPress({ key }) {
            if (this.isActive && (key === 'Escape' || key === 'Esc')) {
                if (this.cancelOptions.indexOf('escape') < 0) return
                this.isActive = false;
            }
        },

        onClick() {
            if (this.triggers.indexOf('click') < 0) return
            this.toggle();
        },
        onContextMenu() {
            if (this.triggers.indexOf('contextmenu') < 0) return
            this.toggle();
        },
        onHover() {
            if (this.triggers.indexOf('hover') < 0) return
            this.isHoverable = true;
        },
        onFocus() {
            if (this.triggers.indexOf('focus') < 0) return
            this.toggle();
        },

        /**
        * Toggle dropdown if it's not disabled.
        */
        toggle() {
            if (this.disabled) return

            if (!this.isActive) {
                // if not active, toggle after clickOutside event
                // this fixes toggling programmatic
                // $nextTick may not wait for other events since Vue 3.
                setTimeout(() => {
                    const value = !this.isActive;
                    this.isActive = value;
                });
            } else {
                this.isActive = !this.isActive;
            }
        },

        updateAppendToBody() {
            const dropdown = this.$refs.dropdown;
            const dropdownMenu = this.$refs.dropdownMenu;
            const trigger = this.$refs.trigger;
            if (dropdownMenu && trigger) {
                // update wrapper dropdown
                const dropdownWrapper = this.$data._bodyEl.children[0];
                dropdownWrapper.classList.forEach((item) => dropdownWrapper.classList.remove(item));
                dropdownWrapper.classList.add('dropdown');
                dropdownWrapper.classList.add('dropdown-menu-animation');
                // TODO: the following test never becomes true on Vue 3.
                //       I have no idea about the intention of it.
                if (this.$vnode && this.$vnode.data && this.$vnode.data.staticClass) {
                    dropdownWrapper.classList.add(this.$vnode.data.staticClass);
                }
                this.rootClasses.forEach((item) => {
                    // skip position prop
                    if (item && typeof item === 'object') {
                        for (const key in item) {
                            if (item[key]) {
                                dropdownWrapper.classList.add(key);
                            }
                        }
                    }
                });
                if (this.appendToBodyCopyParent) {
                    const parentNode = this.$refs.dropdown.parentNode;
                    const parent = this.$data._bodyEl;
                    parent.classList.forEach((item) => parent.classList.remove(item));
                    parentNode.classList.forEach((item) => {
                        parent.classList.add(item);
                    });
                }
                const rect = trigger.getBoundingClientRect();
                let top = rect.top + window.scrollY;
                let left = rect.left + window.scrollX;
                if (!this.position || this.position.indexOf('bottom') >= 0) {
                    top += trigger.clientHeight;
                } else {
                    top -= dropdownMenu.clientHeight;
                }
                if (this.position && this.position.indexOf('left') >= 0) {
                    left -= (dropdownMenu.clientWidth - trigger.clientWidth);
                }
                this.style = {
                    position: 'absolute',
                    top: `${top}px`,
                    left: `${left}px`,
                    zIndex: '99',
                    width: this.expanded ? `${dropdown.offsetWidth}px` : undefined
                };
            }
        }
    },
    mounted() {
        if (this.appendToBody) {
            this.$data._bodyEl = createAbsoluteElement(this.$refs.dropdownMenu);
            this.updateAppendToBody();
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('click', this.clickedOutside);
            document.addEventListener('keyup', this.keyPress);
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('click', this.clickedOutside);
            document.removeEventListener('keyup', this.keyPress);
        }
        if (this.appendToBody) {
            removeElement(this.$data._bodyEl);
        }
    }
};

const _hoisted_1$J = ["tabindex"];
const _hoisted_2$B = ["aria-hidden"];
const _hoisted_3$p = ["aria-hidden"];
const _hoisted_4$i = ["role", "aria-modal"];

function render$P(_ctx, _cache, $props, $setup, $data, $options) {
  const _directive_trap_focus = resolveDirective("trap-focus");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["dropdown dropdown-menu-animation", $options.rootClasses]),
    ref: "dropdown",
    onMouseleave: _cache[4] || (_cache[4] = $event => ($data.isHoverable = false))
  }, [
    (!$props.inline)
      ? (openBlock(), createElementBlock("div", {
          key: 0,
          tabindex: $props.disabled ? false : $props.triggerTabindex,
          ref: "trigger",
          class: "dropdown-trigger",
          onClick: _cache[0] || (_cache[0] = (...args) => ($options.onClick && $options.onClick(...args))),
          onContextmenu: _cache[1] || (_cache[1] = withModifiers((...args) => ($options.onContextMenu && $options.onContextMenu(...args)), ["prevent"])),
          onMouseenter: _cache[2] || (_cache[2] = (...args) => ($options.onHover && $options.onHover(...args))),
          onFocusCapture: _cache[3] || (_cache[3] = (...args) => ($options.onFocus && $options.onFocus(...args))),
          "aria-haspopup": "true"
        }, [
          renderSlot(_ctx.$slots, "trigger", { active: $data.isActive })
        ], 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_1$J))
      : createCommentVNode("v-if", true),
    createVNode(Transition, { name: $props.animation }, {
      default: withCtx(() => [
        ($options.isMobileModal)
          ? withDirectives((openBlock(), createElementBlock("div", {
              key: 0,
              class: "background",
              "aria-hidden": !$data.isActive
            }, null, 8 /* PROPS */, _hoisted_2$B)), [
              [vShow, $data.isActive]
            ])
          : createCommentVNode("v-if", true)
      ]),
      _: 1 /* STABLE */
    }, 8 /* PROPS */, ["name"]),
    createVNode(Transition, {
      name: $props.animation,
      persisted: ""
    }, {
      default: withCtx(() => [
        withDirectives((openBlock(), createElementBlock("div", {
          ref: "dropdownMenu",
          class: "dropdown-menu",
          style: normalizeStyle($data.style),
          "aria-hidden": !$data.isActive
        }, [
          createElementVNode("div", {
            class: "dropdown-content",
            role: $props.ariaRole,
            "aria-modal": !$props.inline,
            style: normalizeStyle($options.contentStyle)
          }, [
            renderSlot(_ctx.$slots, "default")
          ], 12 /* STYLE, PROPS */, _hoisted_4$i)
        ], 12 /* STYLE, PROPS */, _hoisted_3$p)), [
          [vShow, (!$props.disabled && ($data.isActive || $data.isHoverable)) || $props.inline],
          [_directive_trap_focus, $props.trapFocus]
        ])
      ]),
      _: 3 /* FORWARDED */
    }, 8 /* PROPS */, ["name"])
  ], 34 /* CLASS, HYDRATE_EVENTS */))
}

script$W.render = render$P;
script$W.__file = "src/components/dropdown/Dropdown.vue";

var script$V = {
    name: 'BDropdownItem',
    mixins: [InjectedChildMixin('dropdown')],
    props: {
        value: {
            type: [String, Number, Boolean, Object, Array, Function],
            default: null
        },
        separator: Boolean,
        disabled: Boolean,
        custom: Boolean,
        focusable: {
            type: Boolean,
            default: true
        },
        paddingless: Boolean,
        hasLink: Boolean,
        ariaRole: {
            type: String,
            default: ''
        }
    },
    emits: ['click'],
    computed: {
        anchorClasses() {
            return {
                'is-disabled': this.parent.disabled || this.disabled,
                'is-paddingless': this.paddingless,
                'is-active': this.isActive
            }
        },
        itemClasses() {
            return {
                'dropdown-item': !this.hasLink,
                'is-disabled': this.disabled,
                'is-paddingless': this.paddingless,
                'is-active': this.isActive,
                'has-link': this.hasLink
            }
        },
        ariaRoleItem() {
            return this.ariaRole === 'menuitem' || this.ariaRole === 'listitem' ? this.ariaRole : null
        },
        isClickable() {
            return !this.parent.disabled && !this.separator && !this.disabled && !this.custom
        },
        isActive() {
            if (this.parent.selected === null) return false
            if (this.parent.multiple) return this.parent.selected.indexOf(this.value) >= 0
            return this.value === this.parent.selected
        },
        isFocusable() {
            return this.hasLink ? false : this.focusable
        }
    },
    methods: {
        /**
        * Click listener, select the item.
        */
        selectItem() {
            if (!this.isClickable) return

            this.parent.selectItem(this.value);
            this.$emit('click');
        }
    }
};

const _hoisted_1$I = {
  key: 0,
  class: "dropdown-divider"
};
const _hoisted_2$A = ["role", "tabindex"];
const _hoisted_3$o = ["role", "tabindex"];

function render$O(_ctx, _cache, $props, $setup, $data, $options) {
  return ($props.separator)
    ? (openBlock(), createElementBlock("hr", _hoisted_1$I))
    : (!$props.custom && !$props.hasLink)
      ? (openBlock(), createElementBlock("a", {
          key: 1,
          class: normalizeClass(["dropdown-item", $options.anchorClasses]),
          onClick: _cache[0] || (_cache[0] = (...args) => ($options.selectItem && $options.selectItem(...args))),
          role: $options.ariaRoleItem,
          tabindex: $options.isFocusable ? 0 : null
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 10 /* CLASS, PROPS */, _hoisted_2$A))
      : (openBlock(), createElementBlock("div", {
          key: 2,
          class: normalizeClass($options.itemClasses),
          onClick: _cache[1] || (_cache[1] = (...args) => ($options.selectItem && $options.selectItem(...args))),
          role: $options.ariaRoleItem,
          tabindex: $options.isFocusable ? 0 : null
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 10 /* CLASS, PROPS */, _hoisted_3$o))
}

script$V.render = render$O;
script$V.__file = "src/components/dropdown/DropdownItem.vue";

var script$U = {
    name: 'BFieldBody',
    props: {
        message: {
            type: [String, Array]
        },
        type: {
            type: [String, Object]
        }
    },
    render() {
        let first = true;
        // wraps the default slot (children) with `b-field`.
        // children may be given in a fragment and should be extracted.
        let children = this.$slots.default();
        if (children.length === 1 && children[0].type === Fragment) {
            children = children[0].children;
        }
        return h(
            'div',
            { class: 'field-body' },
            {
                default: () => {
                    return children.map((element) => {
                        // skip returns(?) and comments
                        if (element.type === Comment) {
                            return element
                        }
                        let message;
                        if (first) {
                            message = this.message;
                            first = false;
                        }
                        return h(
                            resolveComponent('b-field'),
                            {
                                type: this.type,
                                message
                            },
                            [element]
                        )
                    })
                }
            }
        )
    }
};

script$U.__file = "src/components/field/FieldBody.vue";

var script$T = {
    name: 'BField',
    components: {
        [script$U.name]: script$U
    },
    provide() {
        return {
            BField: this
        }
    },
    inject: {
        parent: {
            from: 'BField',
            default: false
        }
    }, // Used internally only when using Field in Field
    props: {
        type: [String, Object],
        label: String,
        labelFor: String,
        message: [String, Array, Object],
        grouped: Boolean,
        groupMultiline: Boolean,
        position: String,
        expanded: Boolean,
        horizontal: Boolean,
        addons: {
            type: Boolean,
            default: true
        },
        customClass: String,
        labelPosition: {
            type: String,
            default: () => { return config.defaultFieldLabelPosition }
        }
    },
    data() {
        return {
            newType: this.type,
            newMessage: this.message,
            fieldLabelSize: null,
            numberInputClasses: [],
            _isField: true // Used internally by Input and Select
        }
    },
    computed: {
        rootClasses() {
            return [{
                'is-expanded': this.expanded,
                'is-horizontal': this.horizontal,
                'is-floating-in-label': this.hasLabel && !this.horizontal &&
                    this.labelPosition === 'inside',
                'is-floating-label': this.hasLabel && !this.horizontal &&
                    this.labelPosition === 'on-border'
            },
            this.numberInputClasses]
        },
        innerFieldClasses() {
            return [
                this.fieldType(),
                this.newPosition,
                {
                    'is-grouped-multiline': this.groupMultiline
                }
            ]
        },
        hasInnerField() {
            return this.grouped || this.groupMultiline || this.hasAddons()
        },
        /**
        * Correct Bulma class for the side of the addon or group.
        *
        * This is not kept like the others (is-small, etc.),
        * because since 'has-addons' is set automatically it
        * doesn't make sense to teach users what addons are exactly.
        */
        newPosition() {
            if (this.position === undefined) return

            const position = this.position.split('-');
            if (position.length < 1) return

            const prefix = this.grouped
                ? 'is-grouped-'
                : 'has-addons-';

            if (this.position) return prefix + position[1]
            return undefined
        },
        /**
        * Formatted message in case it's an array
        * (each element is separated by <br> tag)
        */
        formattedMessage() {
            if (this.parent && this.parent.hasInnerField) {
                return '' // Message will be displayed in parent field
            }
            if (typeof this.newMessage === 'string') {
                return [this.newMessage]
            }
            const messages = [];
            if (Array.isArray(this.newMessage)) {
                this.newMessage.forEach((message) => {
                    if (typeof message === 'string') {
                        messages.push(message);
                    } else {
                        for (const key in message) {
                            if (message[key]) {
                                messages.push(key);
                            }
                        }
                    }
                });
            } else {
                for (const key in this.newMessage) {
                    if (this.newMessage[key]) {
                        messages.push(key);
                    }
                }
            }
            return messages.filter((m) => !!m)
        },
        hasLabel() {
            return this.label || this.$slots.label
        },
        hasMessage() {
            return ((!this.parent || !this.parent.hasInnerField) && this.newMessage) ||
                this.$slots.message
        }
    },
    watch: {
        /**
        * Set internal type when prop change.
        */
        type(value) {
            this.newType = value;
        },

        /**
        * Set internal message when prop change.
        */
        message(value) {
            this.newMessage = value;
        },

        /**
        * Set parent message if we use Field in Field.
        */
        newMessage(value) {
            if (this.parent && this.parent.hasInnerField) {
                if (!this.parent.type) {
                    this.parent.newType = this.newType;
                }
                if (!this.parent.message) {
                    this.parent.newMessage = value;
                }
            }
        }
    },
    methods: {
        /**
        * Field has addons if there are more than one slot
        * (element / component) in the Field.
        * Or is grouped when prop is set.
        * Is a method to be called when component re-render.
        */
        fieldType() {
            if (this.grouped) return 'is-grouped'
            if (this.hasAddons()) return 'has-addons'
        },
        hasAddons() {
            let renderedNode = 0;
            if (this.$slots.default) {
                renderedNode = this.$slots.default().reduce((i, node) => isTag(node) ? i + 1 : i, 0);
            }
            return (
                renderedNode > 1 &&
                this.addons &&
                !this.horizontal
            )
        },
        // called by a number input if it is a direct child.
        wrapNumberinput({ controlsPosition, size }) {
            const classes = ['has-numberinput'];
            if (controlsPosition) {
                classes.push(`has-numberinput-${controlsPosition}`);
            }
            if (size) {
                classes.push(`has-numberinput-${size}`);
            }
            this.numberInputClasses = classes;
        }
    },
    mounted() {
        if (this.horizontal) {
            // Bulma docs: .is-normal for any .input or .button
            const elements = this.$el.querySelectorAll('.input, .select, .button, .textarea, .b-slider');
            if (elements.length > 0) {
                this.fieldLabelSize = 'is-normal';
            }
        }
    }
};

const _hoisted_1$H = ["for"];
const _hoisted_2$z = ["for"];
const _hoisted_3$n = {
  key: 3,
  class: "field-body"
};

function render$N(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_field_body = resolveComponent("b-field-body");
  const _component_b_field = resolveComponent("b-field");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["field", $options.rootClasses])
  }, [
    ($props.horizontal)
      ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["field-label", [$props.customClass, $data.fieldLabelSize]])
        }, [
          ($options.hasLabel)
            ? (openBlock(), createElementBlock("label", {
                key: 0,
                for: $props.labelFor,
                class: normalizeClass([$props.customClass, "label"])
              }, [
                (_ctx.$slots.label)
                  ? renderSlot(_ctx.$slots, "label", { key: 0 })
                  : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                      createTextVNode(toDisplayString($props.label), 1 /* TEXT */)
                    ], 64 /* STABLE_FRAGMENT */))
              ], 10 /* CLASS, PROPS */, _hoisted_1$H))
            : createCommentVNode("v-if", true)
        ], 2 /* CLASS */))
      : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          ($options.hasLabel)
            ? (openBlock(), createElementBlock("label", {
                key: 0,
                for: $props.labelFor,
                class: normalizeClass([$props.customClass, "label"])
              }, [
                (_ctx.$slots.label)
                  ? renderSlot(_ctx.$slots, "label", { key: 0 })
                  : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                      createTextVNode(toDisplayString($props.label), 1 /* TEXT */)
                    ], 64 /* STABLE_FRAGMENT */))
              ], 10 /* CLASS, PROPS */, _hoisted_2$z))
            : createCommentVNode("v-if", true)
        ], 64 /* STABLE_FRAGMENT */)),
    ($props.horizontal)
      ? (openBlock(), createBlock(_component_b_field_body, {
          key: 2,
          message: $data.newMessage ? $options.formattedMessage : '',
          type: $data.newType
        }, {
          default: withCtx(() => [
            renderSlot(_ctx.$slots, "default")
          ]),
          _: 3 /* FORWARDED */
        }, 8 /* PROPS */, ["message", "type"]))
      : ($options.hasInnerField)
        ? (openBlock(), createElementBlock("div", _hoisted_3$n, [
            createVNode(_component_b_field, {
              addons: false,
              type: $data.newType,
              class: normalizeClass($options.innerFieldClasses)
            }, {
              default: withCtx(() => [
                renderSlot(_ctx.$slots, "default")
              ]),
              _: 3 /* FORWARDED */
            }, 8 /* PROPS */, ["type", "class"])
          ]))
        : renderSlot(_ctx.$slots, "default", { key: 4 }),
    ($options.hasMessage && !$props.horizontal)
      ? (openBlock(), createElementBlock("p", {
          key: 5,
          class: normalizeClass(["help", $data.newType])
        }, [
          (_ctx.$slots.message)
            ? renderSlot(_ctx.$slots, "message", {
                key: 0,
                messages: $options.formattedMessage
              })
            : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList($options.formattedMessage, (mess, i) => {
                return (openBlock(), createElementBlock(Fragment, null, [
                  createTextVNode(toDisplayString(mess) + " ", 1 /* TEXT */),
                  ((i + 1) < $options.formattedMessage.length)
                    ? (openBlock(), createElementBlock("br", { key: i }))
                    : createCommentVNode("v-if", true)
                ], 64 /* STABLE_FRAGMENT */))
              }), 256 /* UNKEYED_FRAGMENT */))
        ], 2 /* CLASS */))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$T.render = render$N;
script$T.__file = "src/components/field/Field.vue";

// These should match the variables in clockpicker.scss
const indicatorSize = 40;
const paddingInner = 5;

var script$S = {
    name: 'BClockpickerFace',
    props: {
        pickerSize: Number,
        min: Number,
        max: Number,
        double: Boolean,
        value: Number,
        faceNumbers: Array,
        disabledValues: Function
    },
    emits: ['change', 'input'],
    data() {
        return {
            isDragging: false,
            inputValue: this.value,
            prevAngle: 720
        }
    },
    computed: {
        /**
        * How many number indicators are shown on the face
        */
        count() {
            return this.max - this.min + 1
        },
        /**
        * How many number indicators are shown per ring on the face
        */
        countPerRing() {
            return this.double ? (this.count / 2) : this.count
        },
        /**
        * Radius of the clock face
        */
        radius() {
            return this.pickerSize / 2
        },
        /**
        * Radius of the outer ring of number indicators
        */
        outerRadius() {
            return this.radius -
                paddingInner -
                indicatorSize / 2
        },
        /**
        * Radius of the inner ring of number indicators
        */
        innerRadius() {
            return Math.max(this.outerRadius * 0.6,
                this.outerRadius - paddingInner - indicatorSize)
            // 48px gives enough room for the outer ring of numbers
        },
        /**
        * The angle for each selectable value
        * For hours this ends up being 30 degrees, for minutes 6 degrees
        */
        degreesPerUnit() {
            return 360 / this.countPerRing
        },
        /**
        * Used for calculating x/y grid location based on degrees
        */
        degrees() {
            return this.degreesPerUnit * Math.PI / 180
        },
        /**
        * Calculates the angle the clock hand should be rotated for the
        * selected value
        */
        handRotateAngle() {
            let currentAngle = this.prevAngle;
            while (currentAngle < 0) currentAngle += 360;
            const targetAngle = this.calcHandAngle(this.displayedValue);
            const degreesDiff = this.shortestDistanceDegrees(currentAngle, targetAngle);
            const angle = this.prevAngle + degreesDiff;
            return angle
        },
        /**
        * Determines how long the selector hand is based on if the
        * selected value is located along the outer or inner ring
        */
        handScale() {
            return this.calcHandScale(this.displayedValue)
        },
        handStyle() {
            return {
                transform: `rotate(${this.handRotateAngle}deg) scaleY(${this.handScale})`,
                transition: '.3s cubic-bezier(.25,.8,.50,1)'
            }
        },
        /**
        * The value the hand should be pointing at
        */
        displayedValue() {
            return this.inputValue == null ? this.min : this.inputValue
        }
    },
    watch: {
        value(value) {
            if (value !== this.inputValue) {
                this.prevAngle = this.handRotateAngle;
            }
            this.inputValue = value;
        }
    },
    methods: {
        isDisabled(value) {
            return this.disabledValues && this.disabledValues(value)
        },
        /**
        * Calculates the distance between two points
        */
        euclidean(p0, p1) {
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;

            return Math.sqrt(dx * dx + dy * dy)
        },
        shortestDistanceDegrees(start, stop) {
            const modDiff = (stop - start) % 360;
            const shortestDistance = 180 - Math.abs(Math.abs(modDiff) - 180);
            return (modDiff + 360) % 360 < 180 ? shortestDistance * 1 : shortestDistance * -1
        },
        /**
        * Calculates the angle of the line from the center point
        * to the given point.
        */
        coordToAngle(center, p1) {
            const value = 2 *
                Math.atan2(p1.y - center.y - this.euclidean(center, p1), p1.x - center.x);
            return Math.abs(value * 180 / Math.PI)
        },
        /**
        * Generates the inline style translate() property for a
        * number indicator, which determines it's location on the
        * clock face
        */
        getNumberTranslate(value) {
            const { x, y } = this.getNumberCoords(value);
            return `translate(${x}px, ${y}px)`
        },
        /***
        * Calculates the coordinates on the clock face for a number
        * indicator value
        */
        getNumberCoords(value) {
            const radius = this.isInnerRing(value) ? this.innerRadius : this.outerRadius;
            return {
                x: Math.round(radius * Math.sin((value - this.min) * this.degrees)),
                y: Math.round(-radius * Math.cos((value - this.min) * this.degrees))
            }
        },
        getFaceNumberClasses(num) {
            return {
                active: num.value === this.displayedValue,
                disabled: this.isDisabled(num.value)
            }
        },
        /**
        * Determines if a value resides on the inner ring
        */
        isInnerRing(value) {
            return this.double && (value - this.min >= this.countPerRing)
        },
        calcHandAngle(value) {
            let angle = this.degreesPerUnit * (value - this.min);
            if (this.isInnerRing(value)) angle -= 360;
            return angle
        },
        calcHandScale(value) {
            return this.isInnerRing(value)
                ? ((this.innerRadius) / this.outerRadius)
                : 1
        },
        onMouseDown(e) {
            e.preventDefault();
            this.isDragging = true;
            this.onDragMove(e);
        },
        onMouseUp() {
            this.isDragging = false;
            if (!this.isDisabled(this.inputValue)) {
                this.$emit('change', this.inputValue);
            }
        },
        onDragMove(e) {
            e.preventDefault();
            if (!this.isDragging && e.type !== 'click') return

            const { width, top, left } = this.$refs.clock.getBoundingClientRect();
            const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
            const center = { x: width / 2, y: -width / 2 };
            const coords = { x: clientX - left, y: top - clientY };
            const handAngle = Math.round(this.coordToAngle(center, coords) + 360) % 360;
            const insideClick = this.double && this.euclidean(center, coords) <
                (this.outerRadius + this.innerRadius) / 2 - 16;

            let value = Math.round(handAngle / this.degreesPerUnit) +
                this.min +
                (insideClick ? this.countPerRing : 0);

            // Necessary to fix edge case when selecting left part of max value
            if (handAngle >= (360 - this.degreesPerUnit / 2)) {
                value = insideClick ? this.max : this.min;
            }
            this.update(value);
        },
        update(value) {
            if (this.inputValue !== value && !this.isDisabled(value)) {
                this.prevAngle = this.handRotateAngle;
                this.inputValue = value;
                this.$emit('input', value);
            }
        }
    }
};

const _hoisted_1$G = {
  class: "b-clockpicker-face-outer-ring",
  ref: "clock"
};

function render$M(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: "b-clockpicker-face",
    onMousedown: _cache[0] || (_cache[0] = (...args) => ($options.onMouseDown && $options.onMouseDown(...args))),
    onMouseup: _cache[1] || (_cache[1] = (...args) => ($options.onMouseUp && $options.onMouseUp(...args))),
    onMousemove: _cache[2] || (_cache[2] = (...args) => ($options.onDragMove && $options.onDragMove(...args))),
    onTouchstart: _cache[3] || (_cache[3] = (...args) => ($options.onMouseDown && $options.onMouseDown(...args))),
    onTouchend: _cache[4] || (_cache[4] = (...args) => ($options.onMouseUp && $options.onMouseUp(...args))),
    onTouchmove: _cache[5] || (_cache[5] = (...args) => ($options.onDragMove && $options.onDragMove(...args)))
  }, [
    createElementVNode("div", _hoisted_1$G, [
      createElementVNode("div", {
        class: "b-clockpicker-face-hand",
        style: normalizeStyle($options.handStyle)
      }, null, 4 /* STYLE */),
      (openBlock(true), createElementBlock(Fragment, null, renderList($props.faceNumbers, (num, index) => {
        return (openBlock(), createElementBlock("span", {
          key: index,
          class: normalizeClass(["b-clockpicker-face-number", $options.getFaceNumberClasses(num)]),
          style: normalizeStyle({ transform: $options.getNumberTranslate(num.value) })
        }, [
          createElementVNode("span", null, toDisplayString(num.label), 1 /* TEXT */)
        ], 6 /* CLASS, STYLE */))
      }), 128 /* KEYED_FRAGMENT */))
    ], 512 /* NEED_PATCH */)
  ], 32 /* HYDRATE_EVENTS */))
}

script$S.render = render$M;
script$S.__file = "src/components/clockpicker/ClockpickerFace.vue";

const outerPadding = 12;

var script$R = {
    name: 'BClockpicker',
    components: {
        [script$S.name]: script$S,
        [script$16.name]: script$16,
        [script$T.name]: script$T,
        [script$17.name]: script$17,
        [script$W.name]: script$W,
        [script$V.name]: script$V
    },
    mixins: [TimepickerMixin],
    props: {
        pickerSize: {
            type: Number,
            default: 290
        },
        incrementMinutes: {
            type: Number,
            default: 5
        },
        autoSwitch: {
            type: Boolean,
            default: true
        },
        type: {
            type: String,
            default: 'is-primary'
        },
        hoursLabel: {
            type: String,
            default: () => config.defaultClockpickerHoursLabel || 'Hours'
        },
        minutesLabel: {
            type: String,
            default: () => config.defaultClockpickerMinutesLabel || 'Min'
        }
    },
    data() {
        return {
            isSelectingHour: true,
            isDragging: false,
            _isClockpicker: true
        }
    },
    computed: {
        hoursDisplay() {
            if (this.hoursSelected == null) return '--'
            if (this.isHourFormat24) return this.pad(this.hoursSelected)

            let display = this.hoursSelected;
            if (this.meridienSelected === this.pmString) {
                display -= 12;
            }
            if (display === 0) display = 12;
            return display
        },
        minutesDisplay() {
            return this.minutesSelected == null ? '--' : this.pad(this.minutesSelected)
        },
        minFaceValue() {
            return this.isSelectingHour &&
                !this.isHourFormat24 &&
                this.meridienSelected === this.pmString
                ? 12
                : 0
        },
        maxFaceValue() {
            return this.isSelectingHour
                ? (
                    !this.isHourFormat24 &&
                    this.meridienSelected === this.amString
                        ? 11
                        : 23
                )
                : 59
        },
        faceSize() {
            return this.pickerSize - (outerPadding * 2)
        },
        faceDisabledValues() {
            return this.isSelectingHour ? this.isHourDisabled : this.isMinuteDisabled
        }
    },
    methods: {
        onClockInput(value) {
            if (this.isSelectingHour) {
                this.hoursSelected = value;
                this.onHoursChange(value);
            } else {
                this.minutesSelected = value;
                this.onMinutesChange(value);
            }
        },
        onClockChange(value) {
            if (this.autoSwitch && this.isSelectingHour) {
                this.isSelectingHour = !this.isSelectingHour;
            }
        },
        onMeridienClick(value) {
            if (this.meridienSelected !== value) {
                this.meridienSelected = value;
                this.onMeridienChange(value);
            }
        },
        /*
         * Avoid dropdown toggle when is already visible
         */
        onInputClick(event) {
            if (this.$refs.dropdown.isActive) {
                event.stopPropagation();
            }
        }
    }
};

const _hoisted_1$F = ["disabled"];
const _hoisted_2$y = {
  key: 0,
  class: "card-header"
};
const _hoisted_3$m = { class: "b-clockpicker-header card-header-title" };
const _hoisted_4$h = { class: "b-clockpicker-time" };
const _hoisted_5$b = {
  key: 0,
  class: "b-clockpicker-period"
};
const _hoisted_6$8 = { class: "card-content" };
const _hoisted_7$8 = {
  key: 0,
  class: "b-clockpicker-time"
};
const _hoisted_8$7 = {
  key: 1,
  class: "b-clockpicker-period"
};
const _hoisted_9$5 = {
  key: 1,
  class: "b-clockpicker-footer card-footer"
};

function render$L(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_input = resolveComponent("b-input");
  const _component_b_clockpicker_face = resolveComponent("b-clockpicker-face");
  const _component_b_dropdown = resolveComponent("b-dropdown");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["b-clockpicker control", [_ctx.size, $props.type, {'is-expanded': _ctx.expanded}]])
  }, [
    (!_ctx.isMobile || _ctx.inline)
      ? (openBlock(), createBlock(_component_b_dropdown, {
          key: 0,
          ref: "dropdown",
          position: _ctx.position,
          disabled: _ctx.disabledOrUndefined,
          inline: _ctx.inline,
          "mobile-modal": _ctx.mobileModal,
          "append-to-body": _ctx.appendToBody,
          "append-to-body-copy-parent": "",
          onActiveChange: _ctx.onActiveChange
        }, createSlots({
          default: withCtx(() => [
            createElementVNode("div", {
              class: "card",
              disabled: _ctx.disabledOrUndefined,
              custom: ""
            }, [
              (_ctx.inline)
                ? (openBlock(), createElementBlock("header", _hoisted_2$y, [
                    createElementVNode("div", _hoisted_3$m, [
                      createElementVNode("div", _hoisted_4$h, [
                        createElementVNode("span", {
                          class: normalizeClass(["b-clockpicker-btn", { active: $data.isSelectingHour }]),
                          onClick: _cache[3] || (_cache[3] = $event => ($data.isSelectingHour = true))
                        }, toDisplayString($options.hoursDisplay), 3 /* TEXT, CLASS */),
                        createElementVNode("span", null, toDisplayString(_ctx.hourLiteral), 1 /* TEXT */),
                        createElementVNode("span", {
                          class: normalizeClass(["b-clockpicker-btn", { active: !$data.isSelectingHour }]),
                          onClick: _cache[4] || (_cache[4] = $event => ($data.isSelectingHour = false))
                        }, toDisplayString($options.minutesDisplay), 3 /* TEXT, CLASS */)
                      ]),
                      (!_ctx.isHourFormat24)
                        ? (openBlock(), createElementBlock("div", _hoisted_5$b, [
                            createElementVNode("div", {
                              class: normalizeClass(["b-clockpicker-btn", {
                                    active: _ctx.meridienSelected === _ctx.amString || _ctx.meridienSelected === _ctx.AM
                                }]),
                              onClick: _cache[5] || (_cache[5] = $event => ($options.onMeridienClick(_ctx.amString)))
                            }, toDisplayString(_ctx.amString), 3 /* TEXT, CLASS */),
                            createElementVNode("div", {
                              class: normalizeClass(["b-clockpicker-btn", {
                                    active: _ctx.meridienSelected === _ctx.pmString || _ctx.meridienSelected === _ctx.PM
                                }]),
                              onClick: _cache[6] || (_cache[6] = $event => ($options.onMeridienClick(_ctx.pmString)))
                            }, toDisplayString(_ctx.pmString), 3 /* TEXT, CLASS */)
                          ]))
                        : createCommentVNode("v-if", true)
                    ])
                  ]))
                : createCommentVNode("v-if", true),
              createElementVNode("div", _hoisted_6$8, [
                createElementVNode("div", {
                  class: "b-clockpicker-body",
                  style: normalizeStyle({ width: $options.faceSize + 'px', height: $options.faceSize + 'px' })
                }, [
                  (!_ctx.inline)
                    ? (openBlock(), createElementBlock("div", _hoisted_7$8, [
                        createElementVNode("div", {
                          class: normalizeClass(["b-clockpicker-btn", { active: $data.isSelectingHour }]),
                          onClick: _cache[7] || (_cache[7] = $event => ($data.isSelectingHour = true))
                        }, toDisplayString($props.hoursLabel), 3 /* TEXT, CLASS */),
                        createElementVNode("span", {
                          class: normalizeClass(["b-clockpicker-btn", { active: !$data.isSelectingHour }]),
                          onClick: _cache[8] || (_cache[8] = $event => ($data.isSelectingHour = false))
                        }, toDisplayString($props.minutesLabel), 3 /* TEXT, CLASS */)
                      ]))
                    : createCommentVNode("v-if", true),
                  (!_ctx.isHourFormat24 && !_ctx.inline)
                    ? (openBlock(), createElementBlock("div", _hoisted_8$7, [
                        createElementVNode("div", {
                          class: normalizeClass(["b-clockpicker-btn", {
                                    active: _ctx.meridienSelected === _ctx.amString || _ctx.meridienSelected === _ctx.AM
                                }]),
                          onClick: _cache[9] || (_cache[9] = $event => ($options.onMeridienClick(_ctx.amString)))
                        }, toDisplayString(_ctx.amString), 3 /* TEXT, CLASS */),
                        createElementVNode("div", {
                          class: normalizeClass(["b-clockpicker-btn", {
                                    active: _ctx.meridienSelected === _ctx.pmString || _ctx.meridienSelected === _ctx.PM
                                }]),
                          onClick: _cache[10] || (_cache[10] = $event => ($options.onMeridienClick(_ctx.pmString)))
                        }, toDisplayString(_ctx.pmString), 3 /* TEXT, CLASS */)
                      ]))
                    : createCommentVNode("v-if", true),
                  createVNode(_component_b_clockpicker_face, {
                    "picker-size": $options.faceSize,
                    min: $options.minFaceValue,
                    max: $options.maxFaceValue,
                    "face-numbers": $data.isSelectingHour ? _ctx.hours : _ctx.minutes,
                    "disabled-values": $options.faceDisabledValues,
                    double: $data.isSelectingHour && _ctx.isHourFormat24,
                    value: $data.isSelectingHour ? _ctx.hoursSelected : _ctx.minutesSelected,
                    onInput: $options.onClockInput,
                    onChange: $options.onClockChange
                  }, null, 8 /* PROPS */, ["picker-size", "min", "max", "face-numbers", "disabled-values", "double", "value", "onInput", "onChange"])
                ], 4 /* STYLE */)
              ]),
              (_ctx.$slots.default !== undefined && _ctx.$slots.default().length)
                ? (openBlock(), createElementBlock("footer", _hoisted_9$5, [
                    renderSlot(_ctx.$slots, "default")
                  ]))
                : createCommentVNode("v-if", true)
            ], 8 /* PROPS */, _hoisted_1$F)
          ]),
          _: 2 /* DYNAMIC */
        }, [
          (!_ctx.inline)
            ? {
                name: "trigger",
                fn: withCtx(() => [
                  renderSlot(_ctx.$slots, "trigger", {}, () => [
                    createVNode(_component_b_input, mergeProps({
                      ref: "input",
                      autocomplete: "off",
                      value: _ctx.formatValue(_ctx.computedValue),
                      placeholder: _ctx.placeholder,
                      size: _ctx.size,
                      icon: _ctx.icon,
                      "icon-pack": _ctx.iconPack,
                      loading: _ctx.loading,
                      disabled: _ctx.disabledOrUndefined,
                      readonly: !_ctx.editable,
                      rounded: _ctx.rounded
                    }, _ctx.$attrs, {
                      "use-html5-validation": _ctx.useHtml5Validation,
                      onClick: $options.onInputClick,
                      onKeyup: _cache[0] || (_cache[0] = withKeys($event => (_ctx.toggle(true)), ["enter"])),
                      onChange: _cache[1] || (_cache[1] = $event => (_ctx.onChange($event.target.value))),
                      onFocus: _ctx.handleOnFocus,
                      onBlur: _cache[2] || (_cache[2] = $event => (_ctx.checkHtml5Validity()))
                    }), null, 16 /* FULL_PROPS */, ["value", "placeholder", "size", "icon", "icon-pack", "loading", "disabled", "readonly", "rounded", "use-html5-validation", "onClick", "onFocus"])
                  ])
                ]),
                key: "0"
              }
            : undefined
        ]), 1032 /* PROPS, DYNAMIC_SLOTS */, ["position", "disabled", "inline", "mobile-modal", "append-to-body", "onActiveChange"]))
      : (openBlock(), createBlock(_component_b_input, mergeProps({
          key: 1,
          ref: "input",
          type: "time",
          autocomplete: "off",
          value: _ctx.formatHHMMSS(_ctx.computedValue),
          placeholder: _ctx.placeholder,
          size: _ctx.size,
          icon: _ctx.icon,
          "icon-pack": _ctx.iconPack,
          loading: _ctx.loading,
          max: _ctx.formatHHMMSS(_ctx.maxTime),
          min: _ctx.formatHHMMSS(_ctx.minTime),
          disabled: _ctx.disabledOrUndefined,
          readonly: false
        }, _ctx.$attrs, {
          "use-html5-validation": _ctx.useHtml5Validation,
          onClick: _cache[11] || (_cache[11] = withModifiers($event => (_ctx.toggle(true)), ["stop"])),
          onKeyup: _cache[12] || (_cache[12] = withKeys($event => (_ctx.toggle(true)), ["enter"])),
          onChange: _ctx.onChangeNativePicker,
          onFocus: _ctx.handleOnFocus,
          onBlur: _cache[13] || (_cache[13] = $event => (_ctx.onBlur() && _ctx.checkHtml5Validity()))
        }), null, 16 /* FULL_PROPS */, ["value", "placeholder", "size", "icon", "icon-pack", "loading", "max", "min", "disabled", "use-html5-validation", "onChange", "onFocus"]))
  ], 2 /* CLASS */))
}

script$R.render = render$L;
script$R.__file = "src/components/clockpicker/Clockpicker.vue";

var Plugin$16 = {
  install: function install(Vue) {
    registerComponent(Vue, script$R);
  }
};
use(Plugin$16);
var Plugin$17 = Plugin$16;

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _isNativeReflectConstruct$1() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct$1()) {
    _construct = Reflect.construct.bind();
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var colorChannels = ['red', 'green', 'blue', 'alpha'];
var colorsNammed = {
  transparent: '#00000000',
  black: '#000000',
  silver: '#c0c0c0',
  gray: '#808080',
  white: '#ffffff',
  maroon: '#800000',
  red: '#ff0000',
  purple: '#800080',
  fuchsia: '#ff00ff',
  green: '#008000',
  lime: '#00ff00',
  olive: '#808000',
  yellow: '#ffff00',
  navy: '#000080',
  blue: '#0000ff',
  teal: '#008080',
  aqua: '#00ffff',
  orange: '#ffa500',
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  blanchedalmond: '#ffebcd',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgreen: '#006400',
  darkgrey: '#a9a9a9',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  greenyellow: '#adff2f',
  grey: '#808080',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgreen: '#90ee90',
  lightgrey: '#d3d3d3',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  oldlace: '#fdf5e6',
  olivedrab: '#6b8e23',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  whitesmoke: '#f5f5f5',
  yellowgreen: '#9acd32',
  rebeccapurple: '#663399'
};
var ColorTypeError = /*#__PURE__*/function (_Error) {
  _inherits(ColorTypeError, _Error);
  var _super = _createSuper(ColorTypeError);
  function ColorTypeError() {
    _classCallCheck(this, ColorTypeError);
    return _super.call(this, 'ColorTypeError: type must be hex(a), rgb(a) or hsl(a)');
  }
  return _createClass(ColorTypeError);
}( /*#__PURE__*/_wrapNativeSuper(Error));
var Color = /*#__PURE__*/function (_Symbol$toString) {
  function Color() {
    var _this = this;
    _classCallCheck(this, Color);
    if (arguments.length > 0) {
      return Color.parse.apply(Color, arguments);
    }
    this.$channels = new Uint8Array(colorChannels.length);
    colorChannels.forEach(function (channel, index) {
      Object.defineProperty(_this, channel, {
        get: function get() {
          return _this.$channels[index];
        },
        set: function set(byte) {
          if (!Number.isNaN(byte / 1)) {
            _this.$channels[index] = Math.min(255, Math.max(0, byte));
          }
        },
        enumerable: true,
        configurable: true
      });
    })
    // Required for observability
    ;
    ['hue', 'saturation', 'lightness'].forEach(function (name) {
      var capitalizedName = name.replace(/^./, function (m) {
        return m.toUpperCase();
      });
      Object.defineProperty(_this, name, {
        get: function get() {
          return _this["get".concat(capitalizedName)]();
        },
        set: function set(value) {
          if (!Number.isNaN(value / 1)) {
            _this["set".concat(capitalizedName)](value);
          }
        },
        enumerable: true,
        configurable: true
      });
    });
  }
  _createClass(Color, [{
    key: "getHue",
    value: function getHue() {
      var _Array$from$map = Array.from(this.$channels).map(function (c) {
          return c / 255;
        }),
        _Array$from$map2 = _slicedToArray(_Array$from$map, 3),
        red = _Array$from$map2[0],
        green = _Array$from$map2[1],
        blue = _Array$from$map2[2];
      var _ref = [Math.min(red, green, blue), Math.max(red, green, blue)],
        min = _ref[0],
        max = _ref[1];
      var delta = max - min;
      var hue = 0;
      if (delta === 0) {
        return hue;
      }
      if (red === max) {
        hue = (green - blue) / delta % 6;
      } else if (green === max) {
        hue = (blue - red) / delta + 2;
      } else {
        hue = (red - green) / delta + 4;
      }
      hue *= 60;
      while (hue !== -Infinity && hue < 0) hue += 360;
      return Math.round(hue % 360);
    }
  }, {
    key: "setHue",
    value: function setHue(value) {
      var color = Color.fromHSL(value, this.saturation, this.lightness, this.alpha / 255);
      for (var i = 0; i < this.$channels.length; i++) {
        this.$channels[i] = Number(color.$channels[i]);
      }
    }
  }, {
    key: "getSaturation",
    value: function getSaturation() {
      var _Array$from$map3 = Array.from(this.$channels).map(function (c) {
          return c / 255;
        }),
        _Array$from$map4 = _slicedToArray(_Array$from$map3, 3),
        red = _Array$from$map4[0],
        green = _Array$from$map4[1],
        blue = _Array$from$map4[2];
      var _ref2 = [Math.min(red, green, blue), Math.max(red, green, blue)],
        min = _ref2[0],
        max = _ref2[1];
      var delta = max - min;
      return delta !== 0 ? Math.round(delta / (1 - Math.abs(2 * this.lightness - 1)) * 100) / 100 : 0;
    }
  }, {
    key: "setSaturation",
    value: function setSaturation(value) {
      var _this2 = this;
      var color = Color.fromHSL(this.hue, value, this.lightness, this.alpha / 255);
      colorChannels.forEach(function (_, i) {
        return _this2.$channels[i] = color.$channels[i];
      });
    }
  }, {
    key: "getLightness",
    value: function getLightness() {
      var _Array$from$map5 = Array.from(this.$channels).map(function (c) {
          return c / 255;
        }),
        _Array$from$map6 = _slicedToArray(_Array$from$map5, 3),
        red = _Array$from$map6[0],
        green = _Array$from$map6[1],
        blue = _Array$from$map6[2];
      var _ref3 = [Math.min(red, green, blue), Math.max(red, green, blue)],
        min = _ref3[0],
        max = _ref3[1];
      return Math.round((max + min) / 2 * 100) / 100;
    }
  }, {
    key: "setLightness",
    value: function setLightness(value) {
      var _this3 = this;
      var color = Color.fromHSL(this.hue, this.lightness, value, this.alpha / 255);
      colorChannels.forEach(function (_, i) {
        return _this3.$channels[i] = color.$channels[i];
      });
    }
  }, {
    key: "clone",
    value: function clone() {
      var _this4 = this;
      var color = new Color();
      colorChannels.forEach(function (_, i) {
        return color.$channels[i] = _this4.$channels[i];
      });
      return color;
    }
  }, {
    key: "toString",
    value: function toString() {
      var _this5 = this;
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'hex';
      switch (String(type).toLowerCase()) {
        case 'hex':
          return '#' + colorChannels.slice(0, 3).map(function (channel) {
            return _this5[channel].toString(16).padStart(2, '0');
          }).join('');
        case 'hexa':
          return '#' + colorChannels.map(function (channel) {
            return _this5[channel].toString(16).padStart(2, '0');
          }).join('');
        case 'rgb':
          return "rgb(".concat(this.red, ", ").concat(this.green, ", ").concat(this.blue, ")");
        case 'rgba':
          return "rgba(".concat(this.red, ", ").concat(this.green, ", ").concat(this.blue, ", ").concat(Math.round(this.alpha / 2.55) / 100, ")");
        case 'hsl':
          return "hsl(".concat(Math.round(this.hue), "deg, ").concat(Math.round(this.saturation * 100), "%, ").concat(Math.round(this.lightness * 100), "%)");
        case 'hsla':
          return "hsla(".concat(Math.round(this.hue), "deg, ").concat(Math.round(this.saturation * 100), "%, ").concat(Math.round(this.lightness * 100), "%, ").concat(Math.round(this.alpha / 2.55) / 100, ")");
        default:
          throw new ColorTypeError();
      }
    }
  }, {
    key: _Symbol$toString,
    get: function get() {
      return this.toString('hex');
    }
  }], [{
    key: "parse",
    value: function parse() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (_typeof(args[0]) === 'object') {
        return Color.parseObject(args[0]);
      } else if (args.every(function (arg) {
        return !Number.isNaN(arg / 1);
      })) {
        var color = new Color();
        if (args.length > 3) {
          color.red = args[0];
          color.green = args[1];
          color.blue = args[2];
          if (args[3]) {
            color.alpha = args[3];
          }
        } else if (args.length === 1) {
          var index = Number(args[0]);
          return Color.parseIndex(index, index > Math.pow(2, 24) ? 3 : 4);
        }
      } else if (typeof args[0] === 'string') {
        var match = null;
        if (typeof colorsNammed[args[0].toLowerCase()] === 'string') {
          return Color.parseHex(colorsNammed[args[0].toLowerCase()]);
        } else if ((match = args[0].match(/^(#|&h|0x)?(([a-f0-9]{3,4}){1,2})$/i)) !== null) {
          return Color.parseHex(match[2]);
        } else if ((match = args[0].match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(\s*,\s*(\d*\.?\d+))?\s*\)$/i)) !== null) {
          var channels = [match[1], match[2], match[3], typeof match[5] !== 'undefined' ? match[5] : 1];
          return Color.fromRGB.apply(Color, _toConsumableArray(channels.map(function (value) {
            return Number(value);
          })));
        } else if (args[0].match(/^(h(sl|wb)a?|lab|color|cmyk)\(/i)) {
          throw new Error('Color expression not implemented yet');
        }
      }
      throw new Error('Invalid color expression');
    }
  }, {
    key: "parseObject",
    value: function parseObject(object) {
      var color = new Color();
      if (object === null || _typeof(object) !== 'object') {
        return color;
      }
      if (Color.isColor(object)) {
        return object.clone();
      }
      colorChannels.forEach(function (channel) {
        if (!Number.isNaN(object[channel])) {
          color[channel] = object[channel];
        }
      });
      return color;
    }
  }, {
    key: "parseHex",
    value: function parseHex(hex) {
      if (typeof hex !== 'string') {
        throw new Error('Hex expression must be a string');
      }
      hex = hex.trim().replace(/^(0x|&h|#)/i, '');
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(function (c) {
          return c.repeat(2);
        }).join('');
      }
      if (!(hex.length === 6 || hex.length === 8)) {
        throw new Error('Incorrect Hex expression length');
      }
      var chans = hex.split(/(..)/).filter(function (value) {
        return value;
      }).map(function (value) {
        return Number.parseInt(value, 16);
      });
      if (typeof chans[3] === 'number') {
        chans[3] /= 255;
      }
      return Color.fromRGB.apply(Color, _toConsumableArray(chans));
    }
  }, {
    key: "parseIndex",
    value: function parseIndex(value) {
      var channels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
      var color = new Color();
      for (var i = 0; i < 4; i++) {
        color[colorChannels[i]] = value >> (channels - i) * 8 && 0xff;
      }
      return color;
    }
  }, {
    key: "fromRGB",
    value: function fromRGB(red, green, blue) {
      var alpha = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      if ([red, green, blue, alpha].some(function (arg) {
        return Number.isNaN(arg / 1);
      })) {
        throw new Error('Invalid arguments');
      }
      alpha *= 255;
      var color = new Color();
      [red, green, blue, alpha].forEach(function (value, index) {
        color[colorChannels[index]] = value;
      });
      return color;
    }
  }, {
    key: "fromHSL",
    value: function fromHSL(hue, saturation, lightness) {
      var alpha = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      if ([hue, saturation, lightness, alpha].some(function (arg) {
        return Number.isNaN(arg);
      })) {
        throw new Error('Invalid arguments');
      }
      while (hue < 0 && hue !== -Infinity) hue += 360;
      hue = hue % 360;
      saturation = Math.max(0, Math.min(1, saturation));
      lightness = Math.max(0, Math.min(1, lightness));
      alpha = Math.max(0, Math.min(1, alpha));
      var c = (1 - Math.abs(2 * lightness - 1)) * saturation;
      var x = c * (1 - Math.abs(hue / 60 % 2 - 1));
      var m = lightness - c / 2;
      var _ref4 = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x],
        _ref5 = _slicedToArray(_ref4, 3),
        r = _ref5[0],
        g = _ref5[1],
        b = _ref5[2];
      return Color.fromRGB((r + m) * 255, (g + m) * 255, (b + m) * 255, alpha);
    }
  }, {
    key: "isColor",
    value: function isColor(arg) {
      return arg instanceof Color;
    }
  }]);
  return Color;
}(Symbol.toString);
var Color$1 = Color;

var script$Q = {
    name: 'BSelect',
    components: {
        [script$17.name]: script$17
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    props: {
        modelValue: {
            type: [String, Number, Boolean, Object, Array, Function, Date],
            default: null
        },
        placeholder: String,
        multiple: Boolean,
        nativeSize: [String, Number]
    },
    emits: ['blur', 'focus', 'update:modelValue'],
    data() {
        return {
            selected: this.modelValue,
            _elementRef: 'select'
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.selected
            },
            set(value) {
                this.selected = value;
                this.$emit('update:modelValue', value);
                !this.isValid && this.checkHtml5Validity();
            }
        },
        spanClasses() {
            return [this.size, this.statusType, {
                'is-fullwidth': this.expanded,
                'is-loading': this.loading,
                'is-multiple': this.multiple,
                'is-rounded': this.rounded,
                'is-empty': this.selected === null
            }]
        }
    },
    watch: {
        /**
        * When v-model is changed:
        *   1. Set the selected option.
        *   2. If it's invalid, validate again.
        */
        modelValue(value) {
            this.selected = value;
            !this.isValid && this.checkHtml5Validity();
        }
    }
};

const _hoisted_1$E = ["multiple", "size"];
const _hoisted_2$x = {
  key: 0,
  value: null,
  disabled: "",
  hidden: ""
};

function render$K(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["control", { 'is-expanded': _ctx.expanded, 'has-icons-left': _ctx.icon }])
  }, [
    createElementVNode("span", {
      class: normalizeClass(["select", $options.spanClasses])
    }, [
      withDirectives(createElementVNode("select", mergeProps({
        "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($options.computedValue) = $event)),
        ref: "select",
        multiple: $props.multiple,
        size: $props.nativeSize
      }, _ctx.$attrs, {
        onBlur: _cache[1] || (_cache[1] = $event => (_ctx.$emit('blur', $event) && _ctx.checkHtml5Validity())),
        onFocus: _cache[2] || (_cache[2] = $event => (_ctx.$emit('focus', $event)))
      }), [
        ($props.placeholder)
          ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              ($options.computedValue == null)
                ? (openBlock(), createElementBlock("option", _hoisted_2$x, toDisplayString($props.placeholder), 1 /* TEXT */))
                : createCommentVNode("v-if", true)
            ], 64 /* STABLE_FRAGMENT */))
          : createCommentVNode("v-if", true),
        renderSlot(_ctx.$slots, "default")
      ], 16 /* FULL_PROPS */, _hoisted_1$E), [
        [vModelSelect, $options.computedValue]
      ])
    ], 2 /* CLASS */),
    (_ctx.icon)
      ? (openBlock(), createBlock(_component_b_icon, {
          key: 0,
          class: "is-left",
          icon: _ctx.icon,
          pack: _ctx.iconPack,
          size: _ctx.iconSize
        }, null, 8 /* PROPS */, ["icon", "pack", "size"]))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$Q.render = render$K;
script$Q.__file = "src/components/select/Select.vue";

const cos30 = 0.86602540378;
const sin30 = 0.5;

let id = 0;

var script$P = {
    name: 'BColorpickerHSLRepresentationTriangle',
    props: {
        value: {
            type: Object,
            required: true,
            validator(value) {
                return typeof value.hue === 'number' &&
                    typeof value.saturation === 'number' &&
                    typeof value.lightness === 'number'
            }
        },
        size: {
            type: Number,
            default: 200
        },
        thickness: {
            type: Number,
            default: 20
        }
    },
    emits: ['input'],
    data() {
        return {
            id: id++,
            hue: this.value.hue,
            saturation: this.value.saturation,
            lightness: this.value.lightness,
            captureMouse: false,
            captureType: 'hue',
            clientOffset: {
                cx: -1,
                cy: -1,
                width: 0,
                height: 0
            },
            cos30,
            sin30,
            debounce: 0
        }
    },
    computed: {
        viewBox() {
            const { size } = this;
            return `0 0 ${size} ${size}`
        },
        internalRadius() {
            return this.size / 2 - this.thickness
        },
        haloPath() {
            const { size, thickness } = this;
            const radius = size / 2 - 2; // 2px padding
            const thicknessRadius = radius - thickness;
            const center = size / 2;

            return `M${center - radius} ${center}a${radius}  ${radius}  0 1 1 ${2 * radius} 0` +
                `h${-thickness}` +
                `a${-thicknessRadius}  ${thicknessRadius}  0 1 0 ${-2 * thicknessRadius} 0` +
                `a${thicknessRadius}  ${thicknessRadius}  0 1 0 ${2 * thicknessRadius} 0` +
                `h${thickness}` +
                `a${radius}  ${radius}  0 1 1 ${-2 * radius} 0z`
        },
        trianglePath() {
            const { size, thickness } = this;
            const radius = size - 4;
            const thicknessRadius = (radius - 2 * thickness) / 2;

            return `M0 ${-thicknessRadius}` +
                `L${cos30 * thicknessRadius} ${sin30 * thicknessRadius}` +
                `H${-cos30 * thicknessRadius}z`
        }
    },
    watch: {
        captureMouse(newValue, oldValue) {
            if (oldValue === false && newValue !== false) {
                const rect = this.$el.getBoundingClientRect();
                // Caching offset
                this.clientOffset.cx = rect.x + rect.width / 2;
                this.clientOffset.cy = rect.y + rect.height / 2;
                this.clientOffset.width = rect.width;
                this.clientOffset.height = rect.height;
            }
        },
        value: {
            deep: true,
            handler(newColor) {
                const { hue, saturation, lightness } = newColor;

                window.clearTimeout(this.debounce);
                this.debounce = window.setTimeout(() => {
                    if (lightness >= 0.03 && lightness <= 0.97 && saturation > 0) {
                        this.hue = hue;
                    }
                    this.saturation = saturation;
                    this.lightness = lightness;
                }, 200);
            }
        }
    },
    methods: {
        increaseHue(value = 1) {
            this.hue = (this.hue + value) % 360;
        },
        decreaseHue(value = 1) {
            this.hue = (360 + this.hue - value) % 360;
        },
        increaseSaturation(value = 0.01) {
            this.saturation = Math.min(1, Math.max(0, this.saturation + value));
            this.lightness = Math.min(
                0.5 + (1 - this.saturation) * 0.5,
                Math.max(
                    0.5 - (1 - this.saturation) * 0.5,
                    this.lightness
                )
            );
        },
        decreaseSaturation(value = 0.01) {
            this.saturation = Math.min(1, Math.max(0, this.saturation - value));
            this.lightness = Math.min(
                0.5 + (1 - this.saturation) * 0.5,
                Math.max(
                    0.5 - (1 - this.saturation) * 0.5,
                    this.lightness
                )
            );
        },
        increaseLightness(value = 0.01) {
            this.lightness = Math.min(
                0.5 + (1 - this.saturation) * 0.5,
                Math.max(
                    0.5 - (1 - this.saturation) * 0.5,
                    this.lightness + value
                )
            );
        },
        decreaseLightness(value = 0.01) {
            this.lightness = Math.min(
                0.5 + (1 - this.saturation) * 0.5,
                Math.max(
                    0.5 - (1 - this.saturation) * 0.5,
                    this.lightness - value
                )
            );
        },
        hueKeyPress(event) {
            let handled = false;
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowUp':
                    this.increaseHue();
                    handled = true;
                    break
                case 'ArrowLeft':
                case 'ArrowDown':
                    this.decreaseHue();
                    handled = true;
                    break
                case 'Home':
                    this.increaseHue(360 - this.hue);
                    handled = true;
                    break
                case 'End':
                    this.decreaseHue(this.hue);
                    handled = true;
                    break
                case 'PageUp':
                    this.increaseHue(60 - this.hue % 60);
                    handled = true;
                    break
                case 'PageDown':
                    this.decreaseHue(60 + this.hue % 60);
                    handled = true;
                    break
            }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
                this.emitColor();
            }
        },
        slKeyPress(event) {
            let handled = false;
            switch (event.key) {
                case 'ArrowRight':
                    this.decreaseLightness();
                    handled = true;
                    break
                case 'ArrowUp':
                    this.increaseSaturation();
                    handled = true;
                    break
                case 'ArrowLeft':
                    this.increaseLightness();
                    handled = true;
                    break
                case 'ArrowDown':
                    this.decreaseSaturation();
                    handled = true;
                    break
                case 'Home':
                    this.increaseLightness(1 - this.lightness);
                    handled = true;
                    break
                case 'End':
                    this.decreaseLightness(this.lightness);
                    handled = true;
                    break
                case 'PageUp':
                    this.increaseSaturation(1 - this.saturation);
                    handled = true;
                    break
                case 'PageDown':
                    this.decreaseSaturation(this.saturation);
                    handled = true;
                    break
            }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
                this.emitColor();
            }
        },
        clickHue(event) {
            this.startMouseCapture(event);
            this.trackMouse(event);
            this.stopMouseCapture(event);
            this.$refs.hueCursor.focus();
        },
        clickSL(event) {
            this.startMouseCapture(event);
            this.trackMouse(event);
            this.stopMouseCapture(event);
            this.$refs.slCursor.focus();
        },
        trackMouse(event) {
            if (this.captureMouse === false) {
                return
            }
            event.preventDefault();
            event.stopPropagation();

            let [mouseX, mouseY] = [0, 0];
            if (typeof event.touches !== 'undefined' && event.touches.length) {
                [mouseX, mouseY] = [event.touches[0].clientX, event.touches[0].clientY];
            } else {
                [mouseX, mouseY] = [event.clientX, event.clientY];
            }
            const angle = Math.atan2(
                mouseY - this.clientOffset.cy,
                mouseX - this.clientOffset.cx
            );

            if (this.captureType === 'sl') {
                const d = Math.sqrt(
                    Math.pow(mouseX - this.clientOffset.cx, 2) +
                    Math.pow(mouseY - this.clientOffset.cy, 2)
                );
                const ratio = this.size / this.clientOffset.width;
                const dx = d * Math.cos(angle - this.hue / 180 * Math.PI) * ratio;
                const dy = d * Math.sin(angle - this.hue / 180 * Math.PI) * ratio;
                const radius = this.internalRadius;
                const saturation = 1 - (Math.min(
                    radius * sin30,
                    Math.max(
                        -radius,
                        dy
                    )
                ) + radius) / (radius + radius * sin30);
                const lightness = (Math.min(
                    (radius * cos30) * (1 - saturation),
                    Math.max(
                        (-radius * cos30) * (1 - saturation),
                        dx
                    )
                ) + radius * cos30) / (radius * 2 * cos30);

                this.saturation = Math.round(saturation * 1000) / 1000;
                this.lightness = 1 - Math.round(lightness * 1000) / 1000;
            } else {
                this.hue = Math.round(angle / Math.PI * 180 + 90) % 360;
            }
            this.emitColor();
        },
        startMouseCapture(event) {
            event.stopPropagation();

            this.captureMouse = true;
            if (event.target.closest('.colorpicker-triangle-slider-sl') !== null) {
                this.captureType = 'sl';
            } else {
                this.captureType = 'hue';
            }
        },
        stopMouseCapture(event) {
            if (this.captureMouse !== false) {
                event.preventDefault();
                event.stopPropagation();
                this.$refs[this.captureType === 'sl' ? 'slCursor' : 'hueCursor'].focus();
            }
            this.captureMouse = false;
        },
        emitColor() {
            const { hue, saturation, lightness } = this;
            this.$emit('input', Color$1.fromHSL(hue, saturation, lightness));
            window.clearTimeout(this.debounce);
        }
    },
    mounted() {
        window.addEventListener('mousemove', this.trackMouse);
        window.addEventListener('touchmove', this.trackMouse, { passive: false });
        window.addEventListener('mouseup', this.stopMouseCapture);
        window.addEventListener('touchend', this.stopMouseCapture);
    },
    beforeUnmount() {
        window.removeEventListener('mousemove', this.trackMouse);
        window.removeEventListener('touchmove', this.trackMouse);
        window.removeEventListener('mouseup', this.stopMouseCapture);
        window.removeEventListener('touchend', this.stopMouseCapture);
    }
};

const _hoisted_1$D = ["viewBox"];
const _hoisted_2$w = ["id"];
const _hoisted_3$l = /*#__PURE__*/createElementVNode("stop", {
  offset: "0%",
  "stop-color": "#fff"
}, null, -1 /* HOISTED */);
const _hoisted_4$g = /*#__PURE__*/createElementVNode("stop", {
  offset: "100%",
  "stop-color": "#000"
}, null, -1 /* HOISTED */);
const _hoisted_5$a = [
  _hoisted_3$l,
  _hoisted_4$g
];
const _hoisted_6$7 = ["id"];
const _hoisted_7$7 = ["stop-color"];
const _hoisted_8$6 = ["stop-color"];
const _hoisted_9$4 = ["id"];
const _hoisted_10$3 = ["d"];
const _hoisted_11$3 = { class: "colorpicker-triangle-slider-hue" };
const _hoisted_12$3 = ["width", "height", "clip-path"];
const _hoisted_13$1 = ["x", "height"];
const _hoisted_14$1 = ["aria-valuenow"];
const _hoisted_15$1 = ["d", "fill"];
const _hoisted_16$1 = ["d", "fill"];
const _hoisted_17$1 = ["x", "y"];
const _hoisted_18$1 = ["aria-datavalues"];

function render$J(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("svg", {
    viewBox: $options.viewBox,
    class: "b-colorpicker-triangle"
  }, [
    createElementVNode("defs", null, [
      createElementVNode("linearGradient", {
        id: `cp-triangle-gradient-ligthness-${$data.id}`,
        x1: "0",
        y1: "0",
        x2: "1",
        y2: "0"
      }, _hoisted_5$a, 8 /* PROPS */, _hoisted_2$w),
      createElementVNode("linearGradient", {
        id: `cp-triangle-gradient-saturation-${$data.id}`,
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, [
        createElementVNode("stop", {
          offset: "0%",
          "stop-color": `hsl(${$data.hue}deg, 100%, 50%)`,
          "stop-opacity": "1"
        }, null, 8 /* PROPS */, _hoisted_7$7),
        createElementVNode("stop", {
          offset: "100%",
          "stop-color": `hsl(${$data.hue}deg, 100%, 50%)`,
          "stop-opacity": "0"
        }, null, 8 /* PROPS */, _hoisted_8$6)
      ], 8 /* PROPS */, _hoisted_6$7),
      createElementVNode("clipPath", {
        id: `cp-triangle-clip-${$data.id}`
      }, [
        createElementVNode("path", { d: $options.haloPath }, null, 8 /* PROPS */, _hoisted_10$3)
      ], 8 /* PROPS */, _hoisted_9$4)
    ]),
    createElementVNode("g", _hoisted_11$3, [
      (openBlock(), createElementBlock("foreignObject", {
        x: 0,
        y: 0,
        width: $props.size,
        height: $props.size,
        "clip-path": `url(#cp-triangle-clip-${$data.id})`
      }, [
        createElementVNode("div", {
          class: "colorpicker-triangle-hue",
          onClick: _cache[0] || (_cache[0] = (...args) => ($options.clickHue && $options.clickHue(...args))),
          onMousedown: _cache[1] || (_cache[1] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"])),
          onTouchstart: _cache[2] || (_cache[2] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"]))
        }, null, 32 /* HYDRATE_EVENTS */)
      ], 8 /* PROPS */, _hoisted_12$3)),
      createElementVNode("g", {
        style: normalizeStyle(`transform: rotate(${$data.hue}deg)`)
      }, [
        (openBlock(), createElementBlock("foreignObject", {
          x: $props.size / 2 - 4,
          y: 0,
          width: "8",
          height: $props.thickness + 4
        }, [
          createElementVNode("div", {
            ref: "hueCursor",
            class: "hue-range-thumb",
            style: normalizeStyle(`background-color: hsl(${$data.hue}deg, 100%, 50%)`),
            role: "slider",
            tabindex: "0",
            "aria-label": "Hue",
            "aria-valuemin": "0",
            "aria-valuenow": $data.hue,
            "aria-valuemax": "360",
            onClick: _cache[3] || (_cache[3] = (...args) => ($options.clickHue && $options.clickHue(...args))),
            onKeydown: _cache[4] || (_cache[4] = (...args) => ($options.hueKeyPress && $options.hueKeyPress(...args))),
            onMousedown: _cache[5] || (_cache[5] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"])),
            onTouchstart: _cache[6] || (_cache[6] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"]))
          }, null, 44 /* STYLE, PROPS, HYDRATE_EVENTS */, _hoisted_14$1)
        ], 8 /* PROPS */, _hoisted_13$1))
      ], 4 /* STYLE */)
    ]),
    createElementVNode("g", {
      class: "colorpicker-triangle-slider-sl",
      style: normalizeStyle(`transform: rotate(${$data.hue}deg) translate(50%, 50%)`),
      role: "graphics-datagroup",
      "aria-datascales": "lightness, saturation"
    }, [
      createElementVNode("path", {
        d: $options.trianglePath,
        fill: `url(#cp-triangle-gradient-ligthness-${$data.id})`
      }, null, 8 /* PROPS */, _hoisted_15$1),
      createElementVNode("path", {
        d: $options.trianglePath,
        fill: `url(#cp-triangle-gradient-saturation-${$data.id})`,
        style: {"mix-blend-mode":"overlay"},
        onClick: _cache[7] || (_cache[7] = (...args) => ($options.clickSL && $options.clickSL(...args))),
        onMousedown: _cache[8] || (_cache[8] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"])),
        onTouchstart: _cache[9] || (_cache[9] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"]))
      }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_16$1),
      (openBlock(), createElementBlock("foreignObject", {
        x: (($options.internalRadius - 3) * $data.cos30) * (-$data.lightness + 0.5) * 2 - 6,
        y: -$options.internalRadius + (1 - $data.saturation) * ($options.internalRadius - 3) * 1.5 - 3,
        width: "12",
        height: "12"
      }, [
        createElementVNode("div", {
          ref: "slCursor",
          class: "sl-range-thumb",
          style: normalizeStyle({
                        backgroundColor: `hsl(${$data.hue}deg, ${$data.saturation * 100}%, ${$data.lightness * 100}%)`
                    }),
          tabindex: "0",
          "aria-datavalues": `${$data.saturation * 100}%, ${$data.lightness * 100}%`,
          onClick: _cache[10] || (_cache[10] = (...args) => ($options.clickSL && $options.clickSL(...args))),
          onKeydown: _cache[11] || (_cache[11] = (...args) => ($options.slKeyPress && $options.slKeyPress(...args))),
          onMousedown: _cache[12] || (_cache[12] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"])),
          onTouchstart: _cache[13] || (_cache[13] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"]))
        }, null, 44 /* STYLE, PROPS, HYDRATE_EVENTS */, _hoisted_18$1)
      ], 8 /* PROPS */, _hoisted_17$1))
    ], 4 /* STYLE */)
  ], 8 /* PROPS */, _hoisted_1$D))
}

script$P.render = render$J;
script$P.__file = "src/components/colorpicker/ColorpickerHSLRepresentationTriangle.vue";

const precision = (strs, ...values) => {
    const tmp = [];
    strs.forEach((str, i) => {
        tmp.push(str);

        if (values[i]) {
            tmp.push(
                Number.isNaN(values[i] / 1)
                    ? values[i]
                    : Math.round(values * 10) / 10
            );
        }
    });

    return tmp.join('')
};

var script$O = {
    name: 'BColorpickerHSLRepresentationSquare',
    props: {
        value: {
            type: Object,
            required: true,
            validator(value) {
                return typeof value.hue === 'number' &&
                    typeof value.saturation === 'number' &&
                    typeof value.lightness === 'number'
            }
        },
        size: {
            type: Number,
            default: 200
        },
        thickness: {
            type: Number,
            default: 20
        }
    },
    emits: ['input'],
    data() {
        return {
            hue: this.value.hue,
            saturation: this.value.saturation,
            lightness: this.value.lightness,
            captureMouse: false,
            captureType: 'hue',
            clientOffset: {
                cx: -1,
                cy: -1,
                width: 0,
                height: 0
            },
            debounce: 0
        }
    },
    computed: {
        hueThumbStyle() {
            const { hue, size, thickness } = this;
            const side = size - thickness;
            const offset = size / 2;
            const angle = ((hue + 720 + 90) % 360) / 180 * Math.PI;
            const ciq = 1 / Math.cos(Math.PI / 4);
            const { x, y } = {
                x: -Math.min(1, Math.max(-1, ciq * Math.cos(angle))) / 2 * side + offset,
                y: -Math.min(1, Math.max(-1, ciq * Math.sin(angle))) / 2 * side + offset
            };
            return {
                background: `hsl(${hue}deg, 100%, 50%)`,
                left: precision`${x}px`,
                top: precision`${y}px`,
                width: precision`${thickness - 2}px`
            }
        },
        slThumbStyle() {
            let { hue, saturation, lightness } = this;
            saturation = Math.max(0, Math.min(1, saturation));
            lightness = Math.max(0, Math.min(1, lightness));
            return {
                background: `hsl(${hue}deg, ${saturation * 100}%, ${lightness * 100}%)`,
                left: `${saturation * 100}%`,
                top: `${(1 - lightness) * 100}%`
            }
        },
        SLBackground() {
            const { hue } = this;
            return `linear-gradient(90deg, hsl(${hue}deg, 0%, 50%), hsl(${hue}deg, 100%, 50%))`
        }
    },
    watch: {
        captureMouse(newValue, oldValue) {
            if (oldValue === false && newValue !== false) {
                const rect = this.$el.getBoundingClientRect();
                // Caching offset
                this.clientOffset.cx = rect.x + rect.width / 2;
                this.clientOffset.cy = rect.y + rect.height / 2;
                this.clientOffset.width = rect.width;
                this.clientOffset.height = rect.height;
            }
        },
        value: {
            deep: true,
            handler(newColor) {
                const { hue, saturation, lightness } = newColor;

                window.clearTimeout(this.debounce);
                this.debounce = window.setTimeout(() => {
                    this.hue = hue;
                    this.saturation = saturation;
                    this.lightness = lightness;
                }, 200);
            }
        }
    },
    methods: {
        increaseHue(value = 1) {
            this.hue = (this.hue + value) % 360;
        },
        decreaseHue(value = 1) {
            this.hue = (360 + this.hue - value) % 360;
        },
        increaseSaturation(value = 0.01) {
            this.saturation = Math.min(1, Math.max(0, this.saturation + value));
            this.lightness = Math.min(
                0.5 + (1 - this.saturation) * 0.5,
                Math.max(
                    0.5 - (1 - this.saturation) * 0.5,
                    this.lightness
                )
            );
        },
        decreaseSaturation(value = 0.01) {
            this.saturation = Math.min(1, Math.max(0, this.saturation - value));
            this.lightness = Math.min(
                0.5 + (1 - this.saturation) * 0.5,
                Math.max(
                    0.5 - (1 - this.saturation) * 0.5,
                    this.lightness
                )
            );
        },
        increaseLightness(value = 0.01) {
            this.lightness = Math.min(
                0.5 + (1 - this.saturation) * 0.5,
                Math.max(
                    0.5 - (1 - this.saturation) * 0.5,
                    this.lightness + value
                )
            );
        },
        decreaseLightness(value = 0.01) {
            this.lightness = Math.min(
                0.5 + (1 - this.saturation) * 0.5,
                Math.max(
                    0.5 - (1 - this.saturation) * 0.5,
                    this.lightness - value
                )
            );
        },
        hueKeyPress(event) {
            let handled = false;
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowUp':
                    this.increaseHue();
                    handled = true;
                    break
                case 'ArrowLeft':
                case 'ArrowDown':
                    this.decreaseHue();
                    handled = true;
                    break
                case 'Home':
                    this.increaseHue(360 - this.hue);
                    handled = true;
                    break
                case 'End':
                    this.decreaseHue(this.hue);
                    handled = true;
                    break
                case 'PageUp':
                    this.increaseHue(60 - this.hue % 60);
                    handled = true;
                    break
                case 'PageDown':
                    this.decreaseHue(60 + this.hue % 60);
                    handled = true;
                    break
            }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
                this.emitColor();
            }
        },
        slKeyPress(event) {
            let handled = false;
            switch (event.key) {
                case 'ArrowRight':
                    this.increaseSaturation();
                    handled = true;
                    break
                case 'ArrowUp':
                    this.increaseLightness();
                    handled = true;
                    break
                case 'ArrowLeft':
                    this.decreaseSaturation();
                    handled = true;
                    break
                case 'ArrowDown':
                    this.decreaseLightness();
                    handled = true;
                    break
                case 'Home':
                    this.increaseLightness(1 - this.lightness);
                    handled = true;
                    break
                case 'End':
                    this.decreaseLightness(this.lightness);
                    handled = true;
                    break
                case 'PageUp':
                    this.increaseSaturation(1 - this.saturation);
                    handled = true;
                    break
                case 'PageDown':
                    this.decreaseSaturation(this.saturation);
                    handled = true;
                    break
            }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
                this.emitColor();
            }
        },
        startMouseCapture(event) {
            event.stopPropagation();

            this.captureMouse = true;
            if (event.target.closest('.colorpicker-square-slider-sl') !== null) {
                this.captureType = 'sl';
            } else {
                this.captureType = 'hue';
            }
        },
        stopMouseCapture(event) {
            if (this.captureMouse !== false) {
                event.preventDefault();
                event.stopPropagation();
                this.$refs[this.captureType === 'sl' ? 'slCursor' : 'hueCursor'].focus();
            }
            this.captureMouse = false;
        },
        clickHue(event) {
            this.startMouseCapture(event);
            this.trackMouse(event);
            this.stopMouseCapture(event);
            this.$refs.hueCursor.focus();
        },
        clickSL(event) {
            this.startMouseCapture(event);
            this.trackMouse(event);
            this.stopMouseCapture(event);
            this.$refs.slCursor.focus();
        },
        trackMouse(event) {
            if (this.captureMouse === false) {
                return
            }
            event.preventDefault();
            event.stopPropagation();

            let [mouseX, mouseY] = [0, 0];
            if (typeof event.touches !== 'undefined' && event.touches.length) {
                [mouseX, mouseY] = [event.touches[0].clientX, event.touches[0].clientY];
            } else {
                [mouseX, mouseY] = [event.clientX, event.clientY];
            }
            const angle = Math.atan2(
                mouseY - this.clientOffset.cy,
                mouseX - this.clientOffset.cx
            );

            if (this.captureType === 'sl') {
                const saturation = (mouseX - this.clientOffset.cx) /
                    (this.clientOffset.width - this.thickness * 2) +
                    0.5;
                const lightness = (mouseY - this.clientOffset.cy) /
                    (this.clientOffset.height - this.thickness * 2) +
                    0.5;

                this.saturation = Math.round(Math.min(1, Math.max(0, saturation)) * 1000) / 1000;
                this.lightness = 1 - Math.round(Math.min(1, Math.max(0, lightness)) * 1000) / 1000;
            } else {
                this.hue = Math.round(angle / Math.PI * 180 + 90) % 360;
            }
            this.emitColor();
        },
        emitColor() {
            const { hue, saturation, lightness } = this;
            this.$emit('input', Color$1.fromHSL(hue, saturation, lightness));
            window.clearTimeout(this.debounce);
        }
    },
    mounted() {
        window.addEventListener('mousemove', this.trackMouse);
        window.addEventListener('touchmove', this.trackMouse, { passive: false });
        window.addEventListener('mouseup', this.stopMouseCapture);
        window.addEventListener('touchend', this.stopMouseCapture);
    },
    beforeUnmount() {
        window.removeEventListener('mousemove', this.trackMouse);
        window.removeEventListener('touchmove', this.trackMouse);
        window.removeEventListener('mouseup', this.stopMouseCapture);
        window.removeEventListener('touchend', this.stopMouseCapture);
    }
};

const _hoisted_1$C = ["aria-datavalues"];

function render$I(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: "b-colorpicker-square",
    style: normalizeStyle({ width: `${$props.size}px` })
  }, [
    createElementVNode("div", {
      class: "colorpicker-square-slider-hue",
      onClick: _cache[0] || (_cache[0] = (...args) => ($options.clickHue && $options.clickHue(...args))),
      onMousedown: _cache[1] || (_cache[1] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"])),
      onTouchstart: _cache[2] || (_cache[2] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"]))
    }, [
      createElementVNode("div", {
        ref: "hueCursor",
        role: "slider",
        class: "hue-range-thumb",
        tabindex: "0",
        "aria-label": "Hue",
        "aria-valuemin": "0",
        "aria-valuemax": "359",
        style: normalizeStyle($options.hueThumbStyle)
      }, null, 4 /* STYLE */)
    ], 32 /* HYDRATE_EVENTS */),
    createElementVNode("div", {
      class: "colorpicker-square-slider-sl",
      style: normalizeStyle({
                background: $options.SLBackground,
                margin: `${$props.thickness}px`
            }),
      "aria-datascales": "lightness, saturation",
      onClick: _cache[7] || (_cache[7] = (...args) => ($options.clickSL && $options.clickSL(...args))),
      onMousedown: _cache[8] || (_cache[8] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"])),
      onTouchstart: _cache[9] || (_cache[9] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"]))
    }, [
      createElementVNode("div", {
        ref: "slCursor",
        role: "slider",
        class: "sl-range-thumb",
        tabindex: "0",
        "aria-datavalues": `${$data.saturation * 100}%, ${$data.lightness * 100}%`,
        style: normalizeStyle($options.slThumbStyle),
        onClick: _cache[3] || (_cache[3] = (...args) => ($options.clickSL && $options.clickSL(...args))),
        onKeydown: _cache[4] || (_cache[4] = (...args) => ($options.slKeyPress && $options.slKeyPress(...args))),
        onMousedown: _cache[5] || (_cache[5] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"])),
        onTouchstart: _cache[6] || (_cache[6] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"]))
      }, null, 44 /* STYLE, PROPS, HYDRATE_EVENTS */, _hoisted_1$C)
    ], 36 /* STYLE, HYDRATE_EVENTS */)
  ], 4 /* STYLE */))
}

script$O.render = render$I;
script$O.__file = "src/components/colorpicker/ColorpickerHSLRepresentationSquare.vue";

var script$N = {
    name: 'BTooltip',
    props: {
        active: {
            type: Boolean,
            default: true
        },
        type: {
            type: String,
            default: () => config.defaultTooltipType
        },
        label: String,
        delay: {
            type: Number,
            default: () => config.defaultTooltipDelay
        },
        closeDelay: {
            type: Number,
            default: () => config.defaultTooltipCloseDelay
        },
        position: {
            type: String,
            default: 'is-top',
            validator(value) {
                return [
                    'is-top',
                    'is-bottom',
                    'is-left',
                    'is-right'
                ].indexOf(value) > -1
            }
        },
        triggers: {
            type: Array,
            default: () => ['hover']
        },
        always: Boolean,
        square: Boolean,
        dashed: Boolean,
        multilined: Boolean,
        size: {
            type: String,
            default: 'is-medium'
        },
        appendToBody: Boolean,
        animated: {
            type: Boolean,
            default: true
        },
        animation: {
            type: String,
            default: 'fade'
        },
        contentClass: String,
        autoClose: {
            type: [Array, Boolean],
            default: true
        }
    },
    emits: ['close', 'open'],
    data() {
        return {
            isActive: false,
            triggerStyle: {},
            timer: null,
            _bodyEl: undefined // Used to append to body
        }
    },
    computed: {
        rootClasses() {
            return ['b-tooltip', this.type, this.position, this.size, {
                'is-square': this.square,
                'is-always': this.always,
                'is-multiline': this.multilined,
                'is-dashed': this.dashed
            }]
        },
        newAnimation() {
            return this.animated ? this.animation : undefined
        }
    },
    watch: {
        isActive() {
            this.$emit(this.isActive ? 'open' : 'close');
            if (this.appendToBody) {
                this.updateAppendToBody();
            }
        }
    },
    methods: {
        updateAppendToBody() {
            const tooltip = this.$refs.tooltip;
            const trigger = this.$refs.trigger;
            if (tooltip && trigger) {
                // update wrapper tooltip
                const tooltipEl = this.$data._bodyEl.children[0];
                tooltipEl.classList.forEach((item) => tooltipEl.classList.remove(item));
                if (
                    this.$vnode &&
                    this.$vnode.data &&
                    this.$vnode.data.staticClass
                ) {
                    tooltipEl.classList.add(this.$vnode.data.staticClass);
                }
                this.rootClasses.forEach((item) => {
                    if (typeof item === 'object') {
                        for (const key in item) {
                            if (item[key]) {
                                tooltipEl.classList.add(key);
                            }
                        }
                    } else {
                        tooltipEl.classList.add(item);
                    }
                });

                const rect = trigger.getBoundingClientRect();

                let top = rect.top + window.scrollY;
                let left = rect.left + window.scrollX;

                const quaterHeight = trigger.clientHeight / 2 / 2;

                switch (this.position) {
                    case 'is-top':
                        tooltipEl.style.width = `${trigger.clientWidth}px`;
                        tooltipEl.style.height = '0px';
                        top -= trigger.clientHeight - quaterHeight;
                        break
                    case 'is-bottom':
                        tooltipEl.style.width = `${trigger.clientWidth}px`;
                        tooltipEl.style.height = '0px';
                        top += quaterHeight;
                        break
                    case 'is-left':
                        tooltipEl.style.width = '0px';
                        tooltipEl.style.height = `${trigger.clientHeight}px`;
                        break
                    case 'is-right':
                        tooltipEl.style.width = '0px';
                        tooltipEl.style.height = `${trigger.clientHeight}px`;
                        left += trigger.clientWidth;
                        break
                }

                const wrapper = this.$data._bodyEl;
                wrapper.style.position = 'absolute';
                wrapper.style.top = `${top}px`;
                wrapper.style.left = `${left}px`;
                wrapper.style.width = '0px';
                wrapper.style.zIndex = this.isActive || this.always ? '99' : '-1';
                this.triggerStyle = {
                    zIndex: this.isActive || this.always ? '100' : undefined
                };
            }
        },
        onClick() {
            if (this.triggers.indexOf('click') < 0) return
            // if not active, toggle after clickOutside event
            // this fixes toggling programmatic
            this.$nextTick(() => {
                setTimeout(() => this.open());
            });
        },
        onHover() {
            if (this.triggers.indexOf('hover') < 0) return
            this.open();
        },
        onContextMenu(e) {
            if (this.triggers.indexOf('contextmenu') < 0) return
            e.preventDefault();
            this.open();
        },
        onFocus() {
            if (this.triggers.indexOf('focus') < 0) return
            this.open();
        },
        open() {
            if (this.delay) {
                this.timer = setTimeout(() => {
                    this.isActive = true;
                    this.timer = null;
                }, this.delay);
            } else {
                this.isActive = true;
            }
        },
        close() {
            if (typeof this.autoClose === 'boolean') {
                if (this.autoClose && this.timer) clearTimeout(this.timer);
                if (this.closeDelay) {
                    this.timer = setTimeout(() => {
                        this.isActive = !this.autoClose;
                        this.timer = null;
                    }, this.closeDelay);
                } else {
                    this.isActive = !this.autoClose;
                }
            }
        },
        /**
        * Close tooltip if clicked outside.
        */
        clickedOutside(event) {
            if (this.isActive) {
                if (Array.isArray(this.autoClose)) {
                    if (this.autoClose.includes('outside')) {
                        if (!this.isInWhiteList(event.target)) {
                            this.isActive = false;
                            return
                        }
                    }
                    if (this.autoClose.includes('inside')) {
                        if (this.isInWhiteList(event.target)) this.isActive = false;
                    }
                }
            }
        },
        /**
         * Keypress event that is bound to the document
         */
        keyPress({ key }) {
            if (this.isActive && (key === 'Escape' || key === 'Esc')) {
                if (Array.isArray(this.autoClose)) {
                    if (this.autoClose.indexOf('escape') >= 0) this.isActive = false;
                }
            }
        },
        /**
        * White-listed items to not close when clicked.
        */
        isInWhiteList(el) {
            if (el === this.$refs.content) return true
            // All chidren from content
            if (this.$refs.content !== undefined) {
                const children = this.$refs.content.querySelectorAll('*');
                for (const child of children) {
                    if (el === child) {
                        return true
                    }
                }
            }
            return false
        }
    },
    mounted() {
        if (this.appendToBody && typeof window !== 'undefined') {
            this.$data._bodyEl = createAbsoluteElement(this.$refs.content);
            this.updateAppendToBody();
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('click', this.clickedOutside);
            document.addEventListener('keyup', this.keyPress);
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('click', this.clickedOutside);
            document.removeEventListener('keyup', this.keyPress);
        }
        if (this.appendToBody) {
            removeElement(this.$data._bodyEl);
        }
    }
};

function render$H(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    ref: "tooltip",
    class: normalizeClass($options.rootClasses)
  }, [
    createVNode(Transition, {
      name: $options.newAnimation,
      persisted: ""
    }, {
      default: withCtx(() => [
        withDirectives(createElementVNode("div", {
          ref: "content",
          class: normalizeClass(['tooltip-content', $props.contentClass])
        }, [
          ($props.label)
            ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                createTextVNode(toDisplayString($props.label), 1 /* TEXT */)
              ], 64 /* STABLE_FRAGMENT */))
            : (_ctx.$slots.content)
              ? renderSlot(_ctx.$slots, "content", { key: 1 })
              : createCommentVNode("v-if", true)
        ], 2 /* CLASS */), [
          [vShow, $props.active && ($data.isActive || $props.always)]
        ])
      ]),
      _: 3 /* FORWARDED */
    }, 8 /* PROPS */, ["name"]),
    createElementVNode("div", {
      ref: "trigger",
      class: "tooltip-trigger",
      style: normalizeStyle($data.triggerStyle),
      onClick: _cache[0] || (_cache[0] = (...args) => ($options.onClick && $options.onClick(...args))),
      onContextmenu: _cache[1] || (_cache[1] = (...args) => ($options.onContextMenu && $options.onContextMenu(...args))),
      onMouseenter: _cache[2] || (_cache[2] = (...args) => ($options.onHover && $options.onHover(...args))),
      onFocusCapture: _cache[3] || (_cache[3] = (...args) => ($options.onFocus && $options.onFocus(...args))),
      onBlurCapture: _cache[4] || (_cache[4] = (...args) => ($options.close && $options.close(...args))),
      onMouseleave: _cache[5] || (_cache[5] = (...args) => ($options.close && $options.close(...args)))
    }, [
      renderSlot(_ctx.$slots, "default", { ref: "slot" })
    ], 36 /* STYLE, HYDRATE_EVENTS */)
  ], 2 /* CLASS */))
}

script$N.render = render$H;
script$N.__file = "src/components/tooltip/Tooltip.vue";

var script$M = {
    name: 'BColorpickerAlphaSlider',
    components: {
        [script$N.name]: script$N
    },
    props: {
        value: {
            type: Number,
            validator: (value) => value >= 0 && value < 256
        },
        color: [String, Object]
    },
    emits: ['input'],
    data() {
        const color = Color$1.parse(this.color);

        color.alpha = 0;
        return {
            startColor: color.toString('hex'),
            endColor: color.toString('hexa'),
            percent: Math.round((1 - this.value / 255) * 100),
            captureMouse: false,
            clientOffset: {
                cx: -1,
                cy: -1,
                width: 0,
                height: 0
            }
        }
    },
    computed: {
        style() {
            return {
                backgroundImage:
                    `linear-gradient(90deg, ${this.startColor} 0%, ${this.endColor} 100%),
                    linear-gradient(45deg, #c7c7c7 25%, transparent 25%, transparent 75%, #c7c7c7 75%, #c7c7c7),
                    linear-gradient(45deg, #c7c7c7 25%, transparent 25%, transparent 75%, #c7c7c7 75%, #c7c7c7)`,
                backgroundSize: '100% 100%, 1em 1em, 1em 1em',
                backgroundPosition: '0 0, .5em .5em, 0 0'
            }
        }
    },
    watch: {
        value(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.percent = Math.round((1 - newValue / 255) * 100);
            }
        },
        color(newColor) {
            const color = Color$1.parse(newColor);

            color.alpha = 0;
            this.startColor = color.toString('hex');
            this.endColor = color.toString('hexa');
        },
        captureMouse(newValue, oldValue) {
            if (oldValue === false && newValue !== false) {
                const rect = this.$el.getBoundingClientRect();
                // Caching offset
                this.clientOffset.cx = rect.x + rect.width / 2;
                this.clientOffset.cy = rect.y + rect.height / 2;
                this.clientOffset.width = rect.width;
                this.clientOffset.height = rect.height;
            }
        }
    },
    methods: {
        increaseAlpha(value = 1) {
            this.percent = Math.max(0, Math.min(100, this.percent + value));
        },
        decreaseAlpha(value = 0.01) {
            this.increaseAlpha(-value);
        },
        alphaKeyPress(event) {
            let handled = false;
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowUp':
                    this.increaseAlpha();
                    handled = true;
                    break
                case 'ArrowLeft':
                case 'ArrowDown':
                    this.decreaseAlpha();
                    handled = true;
                    break
                case 'Home':
                    this.decreaseAlpha(this.percent);
                    handled = true;
                    break
                case 'End':
                    this.increaseAlpha(100 - this.percent);
                    handled = true;
                    break
                case 'PageUp':
                    this.increaseAlpha(10 - (this.percent % 10));
                    handled = true;
                    break
                case 'PageDown':
                    this.decreaseAlpha(this.percent % 10);
                    handled = true;
                    break
            }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
                this.emitAlpha();
            }
        },
        clickAlpha(event) {
            this.startMouseCapture(event);
            this.trackMouse(event);
            this.stopMouseCapture(event);
            this.$refs.alphaCursor.focus();
        },
        startMouseCapture(event) {
            event.stopPropagation();

            this.captureMouse = true;
        },
        trackMouse(event) {
            if (this.captureMouse === false) {
                return
            }
            event.preventDefault();
            event.stopPropagation();

            let [mouseX] = [0, 0];
            if (typeof event.touches !== 'undefined' && event.touches.length) {
                [mouseX] = [event.touches[0].clientX];
            } else {
                [mouseX] = [event.clientX];
            }

            const ratio = 0.5 + (this.clientOffset.cx - mouseX) / this.clientOffset.width;
            this.percent = Math.round(100 - Math.max(0, Math.min(1, ratio)) * 100);
            this.emitAlpha();
        },
        stopMouseCapture(event) {
            if (this.captureMouse !== false) {
                event.preventDefault();
                event.stopPropagation();
                this.$refs.alphaCursor.focus();
            }
            this.captureMouse = false;
        },
        emitAlpha() {
            this.$emit('input', (1 - this.percent / 100) * 255);
        }
    },
    mounted() {
        window.addEventListener('mousemove', this.trackMouse);
        window.addEventListener('touchmove', this.trackMouse, { passive: false });
        window.addEventListener('mouseup', this.stopMouseCapture);
        window.addEventListener('touchend', this.stopMouseCapture);
    },
    beforeUnmount() {
        window.removeEventListener('mousemove', this.trackMouse);
        window.removeEventListener('touchmove', this.trackMouse);
        window.removeEventListener('mouseup', this.stopMouseCapture);
        window.removeEventListener('touchend', this.stopMouseCapture);
    }
};

const _hoisted_1$B = ["aria-valuenow"];

function render$G(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_tooltip = resolveComponent("b-tooltip");

  return (openBlock(), createElementBlock("div", {
    class: "b-colorpicker-alpha-slider",
    style: normalizeStyle($options.style),
    onClick: _cache[0] || (_cache[0] = (...args) => ($options.clickAlpha && $options.clickAlpha(...args))),
    onKeydown: _cache[1] || (_cache[1] = (...args) => ($options.alphaKeyPress && $options.alphaKeyPress(...args))),
    onMousedown: _cache[2] || (_cache[2] = (...args) => ($options.startMouseCapture && $options.startMouseCapture(...args))),
    onTouchstart: _cache[3] || (_cache[3] = withModifiers((...args) => ($options.startMouseCapture && $options.startMouseCapture(...args)), ["prevent"]))
  }, [
    createElementVNode("div", {
      ref: "alphaCursor",
      role: "slider",
      class: "alpha-range-thumb",
      tabindex: "0",
      "aria-label": "Tranparency",
      "aria-valuemin": "0",
      "aria-valuenow": $data.percent,
      "aria-valuemax": "100",
      style: normalizeStyle({ left: `${$data.percent}%` })
    }, [
      createVNode(_component_b_tooltip, {
        label: `${$data.percent}%`,
        always: $data.captureMouse
      }, {
        default: withCtx(() => [
          createTextVNode("   ")
        ]),
        _: 1 /* STABLE */
      }, 8 /* PROPS */, ["label", "always"])
    ], 12 /* STYLE, PROPS */, _hoisted_1$B)
  ], 36 /* STYLE, HYDRATE_EVENTS */))
}

script$M.render = render$G;
script$M.__file = "src/components/colorpicker/ColorpickerAlphaSlider.vue";

const defaultColorFormatter = (color, vm) => {
    if (color.alpha < 1) {
        return color.toString('hexa')
    } else {
        return color.toString('hex')
    }
};

const defaultColorParser = (color, vm) => {
    return Color$1.parse(color)
};

var script$L = {
    name: 'BColorpicker',
    components: {
        [script$P.name]: script$P,
        [script$O.name]: script$O,
        [script$M.name]: script$M,
        [script$16.name]: script$16,
        [script$T.name]: script$T,
        [script$Q.name]: script$Q,
        [script$17.name]: script$17,
        [script$W.name]: script$W,
        [script$V.name]: script$V
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    provide() {
        return {
            $colorpicker: this
        }
    },
    props: {
        modelValue: {
            type: [String, Object],
            validator(value) {
                return typeof value === 'string' ||
                    (
                        typeof value === 'object' &&
                        typeof value.red === 'number' &&
                        typeof value.green === 'number' &&
                        typeof value.blue === 'number'
                    )
            }
        },
        representation: {
            type: String,
            default: 'triangle',
            value(value) {
                return ['triangle', 'square'].some((r) => r === value)
            }
        },
        inline: Boolean,
        disabled: Boolean,
        horizontalColorPicker: {
            type: Boolean,
            default: false
        },
        colorFormatter: {
            type: Function,
            default: (color, vm) => {
                if (typeof config.defaultColorFormatter === 'function') {
                    return config.defaultColorFormatter(color)
                } else {
                    return defaultColorFormatter(color)
                }
            }
        },
        colorParser: {
            type: Function,
            default: (color, vm) => {
                if (typeof config.defaultColorParser === 'function') {
                    return config.defaultColorParser(color)
                } else {
                    return defaultColorParser(color)
                }
            }
        },
        alpha: {
            type: Boolean,
            default: false
        },
        expanded: Boolean,
        position: String,
        mobileModal: {
            type: Boolean,
            default: () => config.defaultDatepickerMobileModal
        },
        focusable: {
            type: Boolean,
            default: true
        },
        trapFocus: {
            type: Boolean,
            default: () => config.defaultTrapFocus
        },
        appendToBody: Boolean
    },
    emits: ['active-change', 'update:modelValue'],
    data() {
        return {
            color: this.parseColor(this.modelValue)
        }
    },
    computed: {
        computedValue: {
            set(value) {
                this.color = this.parseColor(value);
            },
            get() {
                return this.color
            }
        },
        background() {
            if (this.alpha) {
                return `linear-gradient(
                    45deg,
                    ${this.computedValue.toString('hex')} 50%,
                    ${this.computedValue.toString('hexa')} 50%
                )`
            } else {
                const hex = this.computedValue.toString('hex');
                return `linear-gradient(
                    45deg,
                    ${hex} 50%,
                    ${hex} 50%
                )`
            }
        },
        triggerStyle() {
            const { red, green, blue } = this.computedValue;
            const light = (red * 0.299 + green * 0.587 + blue * 0.114) > 186;

            return {
                backgroundColor: '#ffffff',
                backgroundImage: `
                    ${this.background},
                    linear-gradient(45deg, #c7c7c7 25%, transparent 25%, transparent 75%, #c7c7c7 75%, #c7c7c7),
                    linear-gradient(45deg, #c7c7c7 25%, transparent 25%, transparent 75%, #c7c7c7 75%, #c7c7c7)
                `,
                backgroundSize: '100% 100%, 16px 16px, 16px 16px',
                backgroundPosition: '0 0, 8px 8px, 0 0',
                color: light ? '#000000' : '#FFFFFF',
                textShadow: `0 0 2px ${light ? '#FFFFFFAA' : '#000000AA'}`
            }
        },

        isMobile() {
            return this.mobileNative && isMobile.any()
        },

        ariaRole() {
            if (!this.inline) {
                return 'dialog'
            } else {
                return undefined
            }
        }
    },
    watch: {
        modelValue(value) {
            this.computedValue = new Color$1(value);
        }
    },
    methods: {
        parseColor(color) {
            try {
                return this.colorParser(color)
            } catch (e) {
                return new Color$1()
            }
        },
        updateColor(value) {
            value.alpha = this.computedValue.alpha;
            this.computedValue = value;
            this.$emit('update:modelValue', value);
        },
        updateAlpha(alpha) {
            this.computedValue.alpha = alpha;
            this.$emit('update:modelValue', this.computedValue);
        },
        updateRGB() {
            this.$emit('update:modelValue', this.computedValue);
        },
        /*
         * Format color into string
         */
        formatValue(value) {
            return value ? this.colorFormatter(value, this) : null
        },

        /*
         * Toggle datepicker
         */
        togglePicker(active) {
            if (this.$refs.dropdown) {
                const isActive = typeof active === 'boolean'
                    ? active
                    : !this.$refs.dropdown.isActive;
                if (isActive) {
                    this.$refs.dropdown.isActive = isActive;
                } else if (this.closeOnClick) {
                    this.$refs.dropdown.isActive = isActive;
                }
            }
        },

        /*
         * Call default onFocus method and show datepicker
         */
        handleOnFocus(event) {
            this.onFocus(event);
            if (this.openOnFocus) {
                this.togglePicker(true);
            }
        },

        /*
         * Toggle dropdown
         */
        toggle() {
            if (this.mobileNative && this.isMobile) {
                const input = this.$refs.input.$refs.input;
                input.focus();
                input.click();
                return
            }
            this.$refs.dropdown.toggle();
        },

        /*
         * Avoid dropdown toggle when is already visible
         */
        onInputClick(event) {
            if (this.$refs.dropdown.isActive) {
                event.stopPropagation();
            }
        },

        /**
         * Keypress event that is bound to the document.
         */
        keyPress({ key }) {
            if (this.$refs.dropdown && this.$refs.dropdown.isActive && (key === 'Escape' || key === 'Esc')) {
                this.togglePicker(false);
            }
        },

        /**
         * Emit 'blur' event on dropdown is not active (closed)
         */
        onActiveChange(value) {
            if (!value) {
                this.onBlur();
            }
            /*
             * Emit 'active-change' when on dropdown active state change
             */
            this.$emit('active-change', value);
        }
    }
};

const _hoisted_1$A = { class: "color-name" };
const _hoisted_2$v = { class: "colorpicker-header" };
const _hoisted_3$k = { class: "colorpicker-content" };
const _hoisted_4$f = { class: "colorpicker-footer" };

function render$F(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_button = resolveComponent("b-button");
  const _component_b_colorpicker_h_s_l_representation_square = resolveComponent("b-colorpicker-h-s-l-representation-square");
  const _component_b_colorpicker_h_s_l_representation_triangle = resolveComponent("b-colorpicker-h-s-l-representation-triangle");
  const _component_b_colorpicker_alpha_slider = resolveComponent("b-colorpicker-alpha-slider");
  const _component_b_input = resolveComponent("b-input");
  const _component_b_field = resolveComponent("b-field");
  const _component_b_dropdown_item = resolveComponent("b-dropdown-item");
  const _component_b_dropdown = resolveComponent("b-dropdown");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["colorpicker control", [_ctx.size, {'is-expanded': $props.expanded}]])
  }, [
    (!$options.isMobile || $props.inline)
      ? (openBlock(), createBlock(_component_b_dropdown, {
          key: 0,
          ref: "dropdown",
          position: $props.position,
          expanded: $props.expanded,
          disabled: $props.disabled,
          inline: $props.inline,
          "mobile-modal": $props.mobileModal,
          "trap-focus": $props.trapFocus,
          "aria-role": $options.ariaRole,
          "append-to-body": $props.appendToBody,
          "append-to-body-copy-parent": "",
          onActiveChange: $options.onActiveChange
        }, createSlots({
          default: withCtx(() => [
            createVNode(_component_b_dropdown_item, {
              disabled: $props.disabled,
              focusable: $props.focusable,
              custom: "",
              class: normalizeClass({'dropdown-horizontal-colorpicker': $props.horizontalColorPicker})
            }, {
              default: withCtx(() => [
                createElementVNode("div", null, [
                  createElementVNode("header", _hoisted_2$v, [
                    (_ctx.$slots.header !== undefined && _ctx.$slots.header.length)
                      ? renderSlot(_ctx.$slots, "header", { key: 0 })
                      : createCommentVNode("v-if", true)
                  ]),
                  createElementVNode("div", _hoisted_3$k, [
                    ($props.representation === 'square')
                      ? (openBlock(), createBlock(_component_b_colorpicker_h_s_l_representation_square, {
                          key: 0,
                          value: $options.computedValue,
                          onInput: $options.updateColor
                        }, null, 8 /* PROPS */, ["value", "onInput"]))
                      : (openBlock(), createBlock(_component_b_colorpicker_h_s_l_representation_triangle, {
                          key: 1,
                          value: $options.computedValue,
                          onInput: $options.updateColor
                        }, null, 8 /* PROPS */, ["value", "onInput"]))
                  ])
                ]),
                createElementVNode("footer", _hoisted_4$f, [
                  ($props.alpha)
                    ? (openBlock(), createBlock(_component_b_colorpicker_alpha_slider, {
                        key: 0,
                        value: $options.computedValue.alpha,
                        onInput: $options.updateAlpha,
                        color: $options.computedValue
                      }, null, 8 /* PROPS */, ["value", "onInput", "color"]))
                    : createCommentVNode("v-if", true),
                  renderSlot(_ctx.$slots, "footer", { color: $options.computedValue }, () => [
                    createVNode(_component_b_field, {
                      class: "colorpicker-fields",
                      grouped: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_b_field, {
                          horizontal: "",
                          label: "R"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_b_input, {
                              type: "number",
                              modelValue: $options.computedValue.red,
                              "onUpdate:modelValue": [
                                _cache[0] || (_cache[0] = $event => (($options.computedValue.red) = $event)),
                                $options.updateRGB
                              ],
                              modelModifiers: { number: true },
                              size: "is-small",
                              "aria-label": "Red"
                            }, null, 8 /* PROPS */, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1 /* STABLE */
                        }),
                        createVNode(_component_b_field, {
                          horizontal: "",
                          label: "G"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_b_input, {
                              type: "number",
                              modelValue: $options.computedValue.green,
                              "onUpdate:modelValue": [
                                _cache[1] || (_cache[1] = $event => (($options.computedValue.green) = $event)),
                                $options.updateRGB
                              ],
                              modelModifiers: { number: true },
                              size: "is-small",
                              "aria-label": "Green"
                            }, null, 8 /* PROPS */, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1 /* STABLE */
                        }),
                        createVNode(_component_b_field, {
                          horizontal: "",
                          label: "B"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_b_input, {
                              type: "number",
                              modelValue: $options.computedValue.blue,
                              "onUpdate:modelValue": [
                                _cache[2] || (_cache[2] = $event => (($options.computedValue.blue) = $event)),
                                $options.updateRGB
                              ],
                              modelModifiers: { number: true },
                              size: "is-small",
                              "aria-label": "Blue"
                            }, null, 8 /* PROPS */, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1 /* STABLE */
                        })
                      ]),
                      _: 1 /* STABLE */
                    })
                  ])
                ])
              ]),
              _: 3 /* FORWARDED */
            }, 8 /* PROPS */, ["disabled", "focusable", "class"])
          ]),
          _: 2 /* DYNAMIC */
        }, [
          (!$props.inline)
            ? {
                name: "trigger",
                fn: withCtx(() => [
                  renderSlot(_ctx.$slots, "trigger", {}, () => [
                    createVNode(_component_b_button, {
                      style: normalizeStyle($options.triggerStyle),
                      expanded: $props.expanded,
                      disabled: $props.disabled
                    }, {
                      default: withCtx(() => [
                        createElementVNode("span", _hoisted_1$A, toDisplayString($props.colorFormatter($options.computedValue)), 1 /* TEXT */)
                      ]),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["style", "expanded", "disabled"])
                  ])
                ]),
                key: "0"
              }
            : undefined
        ]), 1032 /* PROPS, DYNAMIC_SLOTS */, ["position", "expanded", "disabled", "inline", "mobile-modal", "trap-focus", "aria-role", "append-to-body", "onActiveChange"]))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$L.render = render$F;
script$L.__file = "src/components/colorpicker/Colorpicker.vue";

var Plugin$14 = {
  install: function install(Vue) {
    registerComponent(Vue, script$L);
  }
};
use(Plugin$14);
var Plugin$15 = Plugin$14;

var script$K = {
    name: 'BDatepickerTableRow',
    inject: {
        $datepicker: { name: '$datepicker', default: false }
    },
    props: {
        selectedDate: {
            type: [Date, Array]
        },
        hoveredDateRange: Array,
        day: {
            type: Number
        },
        week: {
            type: Array,
            required: true
        },
        month: {
            type: Number,
            required: true
        },
        minDate: Date,
        maxDate: Date,
        disabled: Boolean,
        unselectableDates: [Array, Function],
        unselectableDaysOfWeek: Array,
        selectableDates: [Array, Function],
        events: Array,
        indicators: String,
        dateCreator: Function,
        nearbyMonthDays: Boolean,
        nearbySelectableMonthDays: Boolean,
        showWeekNumber: Boolean,
        weekNumberClickable: Boolean,
        range: Boolean,
        multiple: Boolean,
        rulesForFirstWeek: Number,
        firstDayOfWeek: Number
    },
    emits: ['change-focus', 'rangeHoverEndDate', 'select'],
    watch: {
        day(day) {
            const refName = `day-${this.month}-${day}`;
            this.$nextTick(() => {
                if (this.$refs[refName] && this.$refs[refName].length > 0) {
                    if (this.$refs[refName][0]) {
                        this.$refs[refName][0].focus();
                    }
                }
            }); // $nextTick needed when month is changed
        }
    },
    methods: {
        firstWeekOffset(year, dow, doy) {
            // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            const fwd = 7 + dow - doy;
            // first-week day local weekday -- which local weekday is fwd
            const firstJanuary = new Date(year, 0, fwd);
            const fwdlw = (7 + firstJanuary.getDay() - dow) % 7;
            return -fwdlw + fwd - 1
        },
        daysInYear(year) {
            return this.isLeapYear(year) ? 366 : 365
        },
        isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
        },
        getSetDayOfYear(input) {
            return Math.round((input - new Date(input.getFullYear(), 0, 1)) / 864e5) + 1
        },
        weeksInYear(year, dow, doy) {
            const weekOffset = this.firstWeekOffset(year, dow, doy);
            const weekOffsetNext = this.firstWeekOffset(year + 1, dow, doy);
            return (this.daysInYear(year) - weekOffset + weekOffsetNext) / 7
        },
        getWeekNumber(mom) {
            const dow = this.firstDayOfWeek; // first day of week
            // Rules for the first week : 1 for the 1st January, 4 for the 4th January
            const doy = this.rulesForFirstWeek;
            const weekOffset = this.firstWeekOffset(mom.getFullYear(), dow, doy);
            const week = Math.floor((this.getSetDayOfYear(mom) - weekOffset - 1) / 7) + 1;
            let resWeek;
            let resYear;
            if (week < 1) {
                resYear = mom.getFullYear() - 1;
                resWeek = week + this.weeksInYear(resYear, dow, doy);
            } else if (week > this.weeksInYear(mom.getFullYear(), dow, doy)) {
                resWeek = week - this.weeksInYear(mom.getFullYear(), dow, doy);
                resYear = mom.getFullYear() + 1;
            } else {
                resYear = mom.getFullYear();
                resWeek = week;
            }
            return { week: resWeek, year: resYear }
        },
        clickWeekNumber(weekData) {
            if (this.weekNumberClickable) {
                this.$datepicker.$emit('week-number-click', weekData.week, weekData.year);
            }
        },
        /*
         * Check that selected day is within earliest/latest params and
         * is within this month
         */
        selectableDate(day) {
            const validity = [];

            if (this.minDate) {
                validity.push(day >= this.minDate);
            }

            if (this.maxDate) {
                validity.push(day <= this.maxDate);
            }

            if (this.nearbyMonthDays && !this.nearbySelectableMonthDays) {
                validity.push(day.getMonth() === this.month);
            }

            if (this.selectableDates) {
                if (typeof this.selectableDates === 'function') {
                    if (this.selectableDates(day)) {
                        return true
                    } else {
                        validity.push(false);
                    }
                } else {
                    for (let i = 0; i < this.selectableDates.length; i++) {
                        const enabledDate = this.selectableDates[i];
                        if (day.getDate() === enabledDate.getDate() &&
                            day.getFullYear() === enabledDate.getFullYear() &&
                            day.getMonth() === enabledDate.getMonth()) {
                            return true
                        } else {
                            validity.push(false);
                        }
                    }
                }
            }

            if (this.unselectableDates) {
                if (typeof this.unselectableDates === 'function') {
                    validity.push(!this.unselectableDates(day));
                } else {
                    for (let i = 0; i < this.unselectableDates.length; i++) {
                        const disabledDate = this.unselectableDates[i];
                        validity.push(
                            day.getDate() !== disabledDate.getDate() ||
                                day.getFullYear() !== disabledDate.getFullYear() ||
                                day.getMonth() !== disabledDate.getMonth()
                        );
                    }
                }
            }

            if (this.unselectableDaysOfWeek) {
                for (let i = 0; i < this.unselectableDaysOfWeek.length; i++) {
                    const dayOfWeek = this.unselectableDaysOfWeek[i];
                    validity.push(day.getDay() !== dayOfWeek);
                }
            }

            return validity.indexOf(false) < 0
        },

        /*
        * Emit select event with chosen date as payload
        */
        emitChosenDate(day) {
            if (this.disabled) return

            if (this.selectableDate(day)) {
                this.$emit('select', day);
            }
        },

        eventsDateMatch(day) {
            if (!this.events || !this.events.length) return false

            const dayEvents = [];

            for (let i = 0; i < this.events.length; i++) {
                if (this.events[i].date.getDay() === day.getDay()) {
                    dayEvents.push(this.events[i]);
                }
            }

            if (!dayEvents.length) {
                return false
            }

            return dayEvents
        },

        /*
        * Build classObject for cell using validations
        */
        classObject(day) {
            function dateMatch(dateOne, dateTwo, multiple) {
                // if either date is null or undefined, return false
                // if using multiple flag, return false
                if (!dateOne || !dateTwo || multiple) {
                    return false
                }

                if (Array.isArray(dateTwo)) {
                    return dateTwo.some((date) => (
                        dateOne.getDate() === date.getDate() &&
                        dateOne.getFullYear() === date.getFullYear() &&
                        dateOne.getMonth() === date.getMonth()
                    ))
                }
                return (dateOne.getDate() === dateTwo.getDate() &&
                    dateOne.getFullYear() === dateTwo.getFullYear() &&
                    dateOne.getMonth() === dateTwo.getMonth())
            }

            function dateWithin(dateOne, dates, multiple) {
                if (!Array.isArray(dates) || multiple) { return false }

                return dateOne > dates[0] && dateOne < dates[1]
            }

            return {
                'is-selected': dateMatch(day, this.selectedDate) || dateWithin(day, this.selectedDate, this.multiple),
                'is-first-selected':
                    dateMatch(
                        day,
                        Array.isArray(this.selectedDate) && this.selectedDate[0],
                        this.multiple
                    ),
                'is-within-selected':
                    dateWithin(day, this.selectedDate, this.multiple),
                'is-last-selected':
                    dateMatch(
                        day,
                        Array.isArray(this.selectedDate) && this.selectedDate[1],
                        this.multiple
                    ),
                'is-within-hovered-range':
                    this.hoveredDateRange && this.hoveredDateRange.length === 2 &&
                    (dateMatch(day, this.hoveredDateRange) ||
                        dateWithin(day, this.hoveredDateRange)),
                'is-first-hovered': dateMatch(
                    day,
                    Array.isArray(this.hoveredDateRange) && this.hoveredDateRange[0]
                ),
                'is-within-hovered':
                    dateWithin(day, this.hoveredDateRange),
                'is-last-hovered': dateMatch(
                    day,
                    Array.isArray(this.hoveredDateRange) && this.hoveredDateRange[1]
                ),
                'is-today': dateMatch(day, this.dateCreator()),
                'is-selectable': this.selectableDate(day) && !this.disabled,
                'is-unselectable': !this.selectableDate(day) || this.disabled,
                'is-invisible': !this.nearbyMonthDays && day.getMonth() !== this.month,
                'is-nearby': this.nearbySelectableMonthDays && day.getMonth() !== this.month,
                'has-event': this.eventsDateMatch(day),
                [this.indicators]: this.eventsDateMatch(day)
            }
        },
        setRangeHoverEndDate(day) {
            if (this.range) {
                this.$emit('rangeHoverEndDate', day);
            }
        },

        manageKeydown(event, weekDay) {
            // https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent/key/Key_Values#Navigation_keys
            const { key } = event;
            let preventDefault = true;
            switch (key) {
                case 'Tab': {
                    preventDefault = false;
                    break
                }

                case ' ':
                case 'Space':
                case 'Spacebar':
                case 'Enter': {
                    this.emitChosenDate(weekDay);
                    break
                }

                case 'ArrowLeft':
                case 'Left': {
                    this.changeFocus(weekDay, -1);
                    break
                }
                case 'ArrowRight':
                case 'Right': {
                    this.changeFocus(weekDay, 1);
                    break
                }
                case 'ArrowUp':
                case 'Up': {
                    this.changeFocus(weekDay, -7);
                    break
                }
                case 'ArrowDown':
                case 'Down': {
                    this.changeFocus(weekDay, 7);
                    break
                }
            }

            if (preventDefault) {
                event.preventDefault();
            }
        },

        changeFocus(day, inc) {
            const nextDay = new Date(day.getTime());
            nextDay.setDate(day.getDate() + inc);
            while (
                (!this.minDate || nextDay > this.minDate) &&
                (!this.maxDate || nextDay < this.maxDate) &&
                !this.selectableDate(nextDay)
            ) {
                nextDay.setDate(day.getDate() + Math.sign(inc));
            }
            this.setRangeHoverEndDate(nextDay);
            this.$emit('change-focus', nextDay);
        }
    }
};

const _hoisted_1$z = { class: "datepicker-row" };
const _hoisted_2$u = ["disabled", "onClick", "onMouseenter", "onKeydown", "tabindex"];
const _hoisted_3$j = {
  key: 0,
  class: "events"
};
const _hoisted_4$e = {
  key: 0,
  class: "events"
};

function render$E(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$z, [
    ($props.showWeekNumber)
      ? (openBlock(), createElementBlock("a", {
          key: 0,
          class: normalizeClass(["datepicker-cell is-week-number", {'is-clickable': $props.weekNumberClickable }]),
          onClick: _cache[0] || (_cache[0] = withModifiers($event => ($options.clickWeekNumber($options.getWeekNumber($props.week[6]))), ["prevent"]))
        }, [
          createElementVNode("span", null, toDisplayString($options.getWeekNumber($props.week[6]).week), 1 /* TEXT */)
        ], 2 /* CLASS */))
      : createCommentVNode("v-if", true),
    (openBlock(true), createElementBlock(Fragment, null, renderList($props.week, (weekDay, index) => {
      return (openBlock(), createElementBlock(Fragment, { key: index }, [
        ($options.selectableDate(weekDay) && !$props.disabled)
          ? (openBlock(), createElementBlock("a", {
              key: 0,
              ref_for: true,
              ref: `day-${weekDay.getMonth()}-${weekDay.getDate()}`,
              class: normalizeClass([$options.classObject(weekDay), "datepicker-cell"]),
              role: "button",
              href: "#",
              disabled: $props.disabled,
              onClick: withModifiers($event => ($options.emitChosenDate(weekDay)), ["prevent"]),
              onMouseenter: $event => ($options.setRangeHoverEndDate(weekDay)),
              onKeydown: $event => ($options.manageKeydown($event, weekDay)),
              tabindex: $props.day === weekDay.getDate() && $props.month === weekDay.getMonth() ? null : -1
            }, [
              createElementVNode("span", null, toDisplayString(weekDay.getDate()), 1 /* TEXT */),
              ($options.eventsDateMatch(weekDay))
                ? (openBlock(), createElementBlock("div", _hoisted_3$j, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList($options.eventsDateMatch(weekDay), (event, evIdx) => {
                      return (openBlock(), createElementBlock("div", {
                        class: normalizeClass(["event", event.type]),
                        key: evIdx
                      }, null, 2 /* CLASS */))
                    }), 128 /* KEYED_FRAGMENT */))
                  ]))
                : createCommentVNode("v-if", true)
            ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_2$u))
          : (openBlock(), createElementBlock("div", {
              key: 1,
              class: normalizeClass([$options.classObject(weekDay), "datepicker-cell"])
            }, [
              createElementVNode("span", null, toDisplayString(weekDay.getDate()), 1 /* TEXT */),
              ($options.eventsDateMatch(weekDay))
                ? (openBlock(), createElementBlock("div", _hoisted_4$e, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList($options.eventsDateMatch(weekDay), (event, evIdx) => {
                      return (openBlock(), createElementBlock("div", {
                        class: normalizeClass(["event", event.type]),
                        key: evIdx
                      }, null, 2 /* CLASS */))
                    }), 128 /* KEYED_FRAGMENT */))
                  ]))
                : createCommentVNode("v-if", true)
            ], 2 /* CLASS */))
      ], 64 /* STABLE_FRAGMENT */))
    }), 128 /* KEYED_FRAGMENT */))
  ]))
}

script$K.render = render$E;
script$K.__file = "src/components/datepicker/DatepickerTableRow.vue";

var script$J = {
    name: 'BDatepickerTable',
    components: {
        [script$K.name]: script$K
    },
    props: {
        modelValue: {
            type: [Date, Array]
        },
        dayNames: Array,
        monthNames: Array,
        firstDayOfWeek: Number,
        events: Array,
        indicators: String,
        minDate: Date,
        maxDate: Date,
        focused: Object,
        disabled: Boolean,
        dateCreator: Function,
        unselectableDates: [Array, Function],
        unselectableDaysOfWeek: Array,
        selectableDates: [Array, Function],
        nearbyMonthDays: Boolean,
        nearbySelectableMonthDays: Boolean,
        showWeekNumber: Boolean,
        weekNumberClickable: Boolean,
        rulesForFirstWeek: Number,
        range: Boolean,
        multiple: Boolean
    },
    emits: ['range-end', 'range-start', 'update:focused', 'update:modelValue'],
    data() {
        return {
            selectedBeginDate: undefined,
            selectedEndDate: undefined,
            hoveredEndDate: undefined
        }
    },
    computed: {
        multipleSelectedDates: {
            get() {
                return this.multiple && this.modelValue ? this.modelValue : []
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        },
        visibleDayNames() {
            const visibleDayNames = [];
            let index = this.firstDayOfWeek;
            while (visibleDayNames.length < this.dayNames.length) {
                const currentDayName = this.dayNames[(index % this.dayNames.length)];
                visibleDayNames.push(currentDayName);
                index++;
            }
            if (this.showWeekNumber) visibleDayNames.unshift('');
            return visibleDayNames
        },

        hasEvents() {
            return this.events && this.events.length
        },

        /*
        * Return array of all events in the specified month
        */
        eventsInThisMonth() {
            if (!this.events) return []

            const monthEvents = [];

            for (let i = 0; i < this.events.length; i++) {
                let event = this.events[i];

                if (!Object.prototype.hasOwnProperty.call(event, 'date')) {
                    event = { date: event };
                }
                if (!Object.prototype.hasOwnProperty.call(event, 'type')) {
                    event.type = 'is-primary';
                }
                if (
                    event.date.getMonth() === this.focused.month &&
                    event.date.getFullYear() === this.focused.year
                ) {
                    monthEvents.push(event);
                }
            }

            return monthEvents
        },
        /*
        * Return array of all weeks in the specified month
        */
        weeksInThisMonth() {
            this.validateFocusedDay();
            const month = this.focused.month;
            const year = this.focused.year;
            const weeksInThisMonth = [];

            let startingDay = 1;

            while (weeksInThisMonth.length < 6) {
                const newWeek = this.weekBuilder(startingDay, month, year);
                weeksInThisMonth.push(newWeek);
                startingDay += 7;
            }

            return weeksInThisMonth
        },
        hoveredDateRange() {
            if (!this.range) {
                return []
            }
            if (!isNaN(this.selectedEndDate)) {
                return []
            }
            if (this.hoveredEndDate < this.selectedBeginDate) {
                return [this.hoveredEndDate, this.selectedBeginDate].filter(isDefined)
            }
            return [this.selectedBeginDate, this.hoveredEndDate].filter(isDefined)
        },

        disabledOrUndefined() {
            // On Vue 3, setting a boolean attribute `false` does not remove it,
            // `null` or `undefined` has to be given to remove it.
            return this.disabled || undefined
        }
    },
    methods: {
        /*
        * Emit input event with selected date as payload for v-model in parent
        */
        updateSelectedDate(date) {
            if (!this.range && !this.multiple) {
                this.$emit('update:modelValue', date);
            } else if (this.range) {
                this.handleSelectRangeDate(date);
            } else if (this.multiple) {
                this.handleSelectMultipleDates(date);
            }
        },

        /*
        * If both begin and end dates are set, reset the end date and set the begin date.
        * If only begin date is selected, emit an array of the begin date and the new date.
        * If not set, only set the begin date.
        */
        handleSelectRangeDate(date) {
            if (this.selectedBeginDate && this.selectedEndDate) {
                this.selectedBeginDate = date;
                this.selectedEndDate = undefined;
                this.$emit('range-start', date);
            } else if (this.selectedBeginDate && !this.selectedEndDate) {
                if (this.selectedBeginDate > date) {
                    this.selectedEndDate = this.selectedBeginDate;
                    this.selectedBeginDate = date;
                } else {
                    this.selectedEndDate = date;
                }
                this.$emit('range-end', date);
                this.$emit('update:modelValue', [this.selectedBeginDate, this.selectedEndDate]);
            } else {
                this.selectedBeginDate = date;
                this.$emit('range-start', date);
            }
        },

        /*
        * If selected date already exists list of selected dates, remove it from the list
        * Otherwise, add date to list of selected dates
        */
        handleSelectMultipleDates(date) {
            const multipleSelect = this.multipleSelectedDates.filter((selectedDate) =>
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getFullYear() === date.getFullYear() &&
                selectedDate.getMonth() === date.getMonth()
            );
            if (multipleSelect.length) {
                this.multipleSelectedDates = this.multipleSelectedDates.filter((selectedDate) =>
                    selectedDate.getDate() !== date.getDate() ||
                    selectedDate.getFullYear() !== date.getFullYear() ||
                    selectedDate.getMonth() !== date.getMonth()
                );
            } else {
                this.multipleSelectedDates = [...this.multipleSelectedDates, date];
            }
        },

        /*
         * Return array of all days in the week that the startingDate is within
         */
        weekBuilder(startingDate, month, year) {
            const thisMonth = new Date(year, month);

            const thisWeek = [];

            const dayOfWeek = new Date(year, month, startingDate).getDay();

            const end = dayOfWeek >= this.firstDayOfWeek
                ? (dayOfWeek - this.firstDayOfWeek)
                : ((7 - this.firstDayOfWeek) + dayOfWeek);

            let daysAgo = 1;
            for (let i = 0; i < end; i++) {
                thisWeek.unshift(new Date(
                    thisMonth.getFullYear(),
                    thisMonth.getMonth(),
                    startingDate - daysAgo)
                );
                daysAgo++;
            }

            thisWeek.push(new Date(year, month, startingDate));

            let daysForward = 1;
            while (thisWeek.length < 7) {
                thisWeek.push(new Date(year, month, startingDate + daysForward));
                daysForward++;
            }

            return thisWeek
        },

        validateFocusedDay() {
            const focusedDate = new Date(this.focused.year, this.focused.month, this.focused.day);
            if (this.selectableDate(focusedDate)) return

            let day = 0;
            // Number of days in the current month
            const monthDays = new Date(this.focused.year, this.focused.month + 1, 0).getDate();
            let firstFocusable = null;
            while (!firstFocusable && ++day < monthDays) {
                const date = new Date(this.focused.year, this.focused.month, day);
                if (this.selectableDate(date)) {
                    firstFocusable = focusedDate;

                    const focused = {
                        day: date.getDate(),
                        month: date.getMonth(),
                        year: date.getFullYear()
                    };
                    this.$emit('update:focused', focused);
                }
            }
        },

        /*
         * Check that selected day is within earliest/latest params and
         * is within this month
         */
        selectableDate(day) {
            const validity = [];

            if (this.minDate) {
                validity.push(day >= this.minDate);
            }

            if (this.maxDate) {
                validity.push(day <= this.maxDate);
            }

            if (this.nearbyMonthDays && !this.nearbySelectableMonthDays) {
                validity.push(day.getMonth() === this.focused.month);
            }

            if (this.selectableDates) {
                if (typeof this.selectableDates === 'function') {
                    if (this.selectableDates(day)) {
                        return true
                    } else {
                        validity.push(false);
                    }
                } else {
                    for (let i = 0; i < this.selectableDates.length; i++) {
                        const enabledDate = this.selectableDates[i];
                        if (day.getDate() === enabledDate.getDate() &&
                            day.getFullYear() === enabledDate.getFullYear() &&
                            day.getMonth() === enabledDate.getMonth()) {
                            return true
                        } else {
                            validity.push(false);
                        }
                    }
                }
            }

            if (this.unselectableDates) {
                if (typeof this.unselectableDates === 'function') {
                    validity.push(!this.unselectableDates(day));
                } else {
                    for (let i = 0; i < this.unselectableDates.length; i++) {
                        const disabledDate = this.unselectableDates[i];
                        validity.push(
                            day.getDate() !== disabledDate.getDate() ||
                                day.getFullYear() !== disabledDate.getFullYear() ||
                                day.getMonth() !== disabledDate.getMonth()
                        );
                    }
                }
            }

            if (this.unselectableDaysOfWeek) {
                for (let i = 0; i < this.unselectableDaysOfWeek.length; i++) {
                    const dayOfWeek = this.unselectableDaysOfWeek[i];
                    validity.push(day.getDay() !== dayOfWeek);
                }
            }

            return validity.indexOf(false) < 0
        },

        eventsInThisWeek(week) {
            return this.eventsInThisMonth.filter((event) => {
                const stripped = new Date(Date.parse(event.date));
                stripped.setHours(0, 0, 0, 0);
                const timed = stripped.getTime();

                return week.some((weekDate) => weekDate.getTime() === timed)
            })
        },

        setRangeHoverEndDate(day) {
            this.hoveredEndDate = day;
        },

        changeFocus(day) {
            const focused = {
                day: day.getDate(),
                month: day.getMonth(),
                year: day.getFullYear()
            };
            this.$emit('update:focused', focused);
        }
    }
};

const _hoisted_1$y = { class: "datepicker-table" };
const _hoisted_2$t = { class: "datepicker-header" };

function render$D(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_datepicker_table_row = resolveComponent("b-datepicker-table-row");

  return (openBlock(), createElementBlock("section", _hoisted_1$y, [
    createElementVNode("header", _hoisted_2$t, [
      (openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleDayNames, (day, index) => {
        return (openBlock(), createElementBlock("div", {
          key: index,
          class: "datepicker-cell"
        }, [
          createElementVNode("span", null, toDisplayString(day), 1 /* TEXT */)
        ]))
      }), 128 /* KEYED_FRAGMENT */))
    ]),
    createElementVNode("div", {
      class: normalizeClass(["datepicker-body", {'has-events':$options.hasEvents}])
    }, [
      (openBlock(true), createElementBlock(Fragment, null, renderList($options.weeksInThisMonth, (week, index) => {
        return (openBlock(), createBlock(_component_b_datepicker_table_row, {
          key: index,
          "selected-date": $props.modelValue,
          day: $props.focused.day,
          week: week,
          month: $props.focused.month,
          "min-date": $props.minDate,
          "max-date": $props.maxDate,
          disabled: $options.disabledOrUndefined,
          "unselectable-dates": $props.unselectableDates,
          "unselectable-days-of-week": $props.unselectableDaysOfWeek,
          "selectable-dates": $props.selectableDates,
          events: $options.eventsInThisWeek(week),
          indicators: $props.indicators,
          "date-creator": $props.dateCreator,
          "nearby-month-days": $props.nearbyMonthDays,
          "nearby-selectable-month-days": $props.nearbySelectableMonthDays,
          "show-week-number": $props.showWeekNumber,
          "week-number-clickable": $props.weekNumberClickable,
          "first-day-of-week": $props.firstDayOfWeek,
          "rules-for-first-week": $props.rulesForFirstWeek,
          range: $props.range,
          "hovered-date-range": $options.hoveredDateRange,
          onSelect: $options.updateSelectedDate,
          onRangeHoverEndDate: $options.setRangeHoverEndDate,
          multiple: $props.multiple,
          onChangeFocus: $options.changeFocus
        }, null, 8 /* PROPS */, ["selected-date", "day", "week", "month", "min-date", "max-date", "disabled", "unselectable-dates", "unselectable-days-of-week", "selectable-dates", "events", "indicators", "date-creator", "nearby-month-days", "nearby-selectable-month-days", "show-week-number", "week-number-clickable", "first-day-of-week", "rules-for-first-week", "range", "hovered-date-range", "onSelect", "onRangeHoverEndDate", "multiple", "onChangeFocus"]))
      }), 128 /* KEYED_FRAGMENT */))
    ], 2 /* CLASS */)
  ]))
}

script$J.render = render$D;
script$J.__file = "src/components/datepicker/DatepickerTable.vue";

var script$I = {
    name: 'BDatepickerMonth',
    props: {
        modelValue: {
            type: [Date, Array]
        },
        monthNames: Array,
        events: Array,
        indicators: String,
        minDate: Date,
        maxDate: Date,
        focused: Object,
        disabled: Boolean,
        dateCreator: Function,
        unselectableDates: [Array, Function],
        unselectableDaysOfWeek: Array,
        selectableDates: [Array, Function],
        range: Boolean,
        multiple: Boolean
    },
    emits: ['change-focus', 'range-end', 'range-start', 'update:modelValue'],
    data() {
        return {
            selectedBeginDate: undefined,
            selectedEndDate: undefined,
            hoveredEndDate: undefined,
            multipleSelectedDates: this.multiple && this.modelValue ? this.modelValue : []
        }
    },
    computed: {
        hasEvents() {
            return this.events && this.events.length
        },

        /*
        * Return array of all events in the specified month
        */
        eventsInThisYear() {
            if (!this.events) return []

            const yearEvents = [];

            for (let i = 0; i < this.events.length; i++) {
                let event = this.events[i];

                if (!Object.prototype.hasOwnProperty.call(event, 'date')) {
                    event = { date: event };
                }
                if (!Object.prototype.hasOwnProperty.call(event, 'type')) {
                    event.type = 'is-primary';
                }
                if (
                    event.date.getFullYear() === this.focused.year
                ) {
                    yearEvents.push(event);
                }
            }

            return yearEvents
        },
        monthDates() {
            const year = this.focused.year;
            const months = [];
            for (let i = 0; i < 12; i++) {
                const d = new Date(year, i, 1);
                d.setHours(0, 0, 0, 0);
                months.push(d);
            }
            return months
        },

        focusedMonth() {
            return this.focused.month
        },

        hoveredDateRange() {
            if (!this.range) {
                return []
            }
            if (!isNaN(this.selectedEndDate)) {
                return []
            }
            if (this.hoveredEndDate < this.selectedBeginDate) {
                return [this.hoveredEndDate, this.selectedBeginDate].filter(isDefined)
            }
            return [this.selectedBeginDate, this.hoveredEndDate].filter(isDefined)
        },

        disabledOrUndefined() {
            // On Vue 3, setting a boolean attribute `false` does not remove it,
            // `null` or `undefined` has to be given to remove it.
            return this.disabled || undefined
        }
    },
    watch: {
        focusedMonth(month) {
            const refName = `month-${month}`;
            if (this.$refs[refName] && this.$refs[refName].length > 0) {
                this.$nextTick(() => {
                    if (this.$refs[refName][0]) {
                        this.$refs[refName][0].focus();
                    }
                }); // $nextTick needed when year is changed
            }
        }
    },
    methods: {
        selectMultipleDates(date) {
            const multipleSelect = this.multipleSelectedDates.filter((selectedDate) =>
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getFullYear() === date.getFullYear() &&
                selectedDate.getMonth() === date.getMonth()
            );
            if (multipleSelect.length) {
                this.multipleSelectedDates = this.multipleSelectedDates.filter((selectedDate) =>
                    selectedDate.getDate() !== date.getDate() ||
                    selectedDate.getFullYear() !== date.getFullYear() ||
                    selectedDate.getMonth() !== date.getMonth()
                );
            } else {
                this.multipleSelectedDates.push(date);
            }
            this.$emit('update:modelValue', this.multipleSelectedDates);
        },

        selectableDate(day) {
            const validity = [];

            if (this.minDate) {
                validity.push(day >= this.minDate);
            }

            if (this.maxDate) {
                validity.push(day <= this.maxDate);
            }

            validity.push(day.getFullYear() === this.focused.year);

            if (this.selectableDates) {
                if (typeof this.selectableDates === 'function') {
                    if (this.selectableDates(day)) {
                        return true
                    } else {
                        validity.push(false);
                    }
                } else {
                    for (let i = 0; i < this.selectableDates.length; i++) {
                        const enabledDate = this.selectableDates[i];
                        if (day.getFullYear() === enabledDate.getFullYear() &&
                            day.getMonth() === enabledDate.getMonth()) {
                            return true
                        } else {
                            validity.push(false);
                        }
                    }
                }
            }

            if (this.unselectableDates) {
                if (typeof this.unselectableDates === 'function') {
                    validity.push(!this.unselectableDates(day));
                } else {
                    for (let i = 0; i < this.unselectableDates.length; i++) {
                        const disabledDate = this.unselectableDates[i];
                        validity.push(
                            day.getFullYear() !== disabledDate.getFullYear() ||
                                day.getMonth() !== disabledDate.getMonth()
                        );
                    }
                }
            }

            if (this.unselectableDaysOfWeek) {
                for (let i = 0; i < this.unselectableDaysOfWeek.length; i++) {
                    const dayOfWeek = this.unselectableDaysOfWeek[i];
                    validity.push(day.getDay() !== dayOfWeek);
                }
            }

            return validity.indexOf(false) < 0
        },
        eventsDateMatch(day) {
            if (!this.eventsInThisYear.length) return false

            const monthEvents = [];

            for (let i = 0; i < this.eventsInThisYear.length; i++) {
                if (this.eventsInThisYear[i].date.getMonth() === day.getMonth()) {
                    monthEvents.push(this.events[i]);
                }
            }

            if (!monthEvents.length) {
                return false
            }

            return monthEvents
        },
        /*
        * Build classObject for cell using validations
        */
        classObject(day) {
            function dateMatch(dateOne, dateTwo, multiple) {
                // if either date is null or undefined, return false
                if (!dateOne || !dateTwo || multiple) {
                    return false
                }
                if (Array.isArray(dateTwo)) {
                    return dateTwo.some((date) => (
                        dateOne.getFullYear() === date.getFullYear() &&
                        dateOne.getMonth() === date.getMonth()
                    ))
                }
                return (dateOne.getFullYear() === dateTwo.getFullYear() &&
                    dateOne.getMonth() === dateTwo.getMonth())
            }
            function dateWithin(dateOne, dates, multiple) {
                if (!Array.isArray(dates) || multiple) { return false }

                return dateOne > dates[0] && dateOne < dates[1]
            }
            function dateMultipleSelected(dateOne, dates, multiple) {
                if (!Array.isArray(dates) || !multiple) { return false }
                return dates.some((date) => (
                    dateOne.getDate() === date.getDate() &&
                    dateOne.getFullYear() === date.getFullYear() &&
                    dateOne.getMonth() === date.getMonth()
                ))
            }

            return {
                'is-selected': dateMatch(day, this.modelValue, this.multiple) ||
                               dateWithin(day, this.modelValue, this.multiple) ||
                               dateMultipleSelected(day, this.multipleSelectedDates, this.multiple),
                'is-first-selected':
                    dateMatch(
                        day,
                        Array.isArray(this.modelValue) && this.modelValue[0],
                        this.multiple
                    ),
                'is-within-selected':
                    dateWithin(day, this.modelValue, this.multiple),
                'is-last-selected':
                    dateMatch(
                        day,
                        Array.isArray(this.modelValue) && this.modelValue[1],
                        this.multiple
                    ),
                'is-within-hovered-range':
                    this.hoveredDateRange && this.hoveredDateRange.length === 2 &&
                    (dateMatch(day, this.hoveredDateRange) ||
                        dateWithin(day, this.hoveredDateRange)),
                'is-first-hovered': dateMatch(
                    day,
                    Array.isArray(this.hoveredDateRange) && this.hoveredDateRange[0]
                ),
                'is-within-hovered':
                    dateWithin(day, this.hoveredDateRange),
                'is-last-hovered': dateMatch(
                    day,
                    Array.isArray(this.hoveredDateRange) && this.hoveredDateRange[1]
                ),
                'is-today': dateMatch(day, this.dateCreator()),
                'is-selectable': this.selectableDate(day) && !this.disabled,
                'is-unselectable': !this.selectableDate(day) || this.disabled
            }
        },

        manageKeydown({ key }, date) {
            // https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent/key/Key_Values#Navigation_keys
            switch (key) {
                case ' ':
                case 'Space':
                case 'Spacebar':
                case 'Enter': {
                    this.updateSelectedDate(date);
                    break
                }

                case 'ArrowLeft':
                case 'Left': {
                    this.changeFocus(date, -1);
                    break
                }
                case 'ArrowRight':
                case 'Right': {
                    this.changeFocus(date, 1);
                    break
                }
                case 'ArrowUp':
                case 'Up': {
                    this.changeFocus(date, -3);
                    break
                }
                case 'ArrowDown':
                case 'Down': {
                    this.changeFocus(date, 3);
                    break
                }
            }
        },

        /*
        * Emit input event with selected date as payload for v-model in parent
        */
        updateSelectedDate(date) {
            if (!this.range && !this.multiple) {
                this.emitChosenDate(date);
            } else if (this.range) {
                this.handleSelectRangeDate(date);
            } else if (this.multiple) {
                this.selectMultipleDates(date);
            }
        },

        /*
         * Emit select event with chosen date as payload
         */
        emitChosenDate(day) {
            if (this.disabled) return

            if (!this.multiple) {
                if (this.selectableDate(day)) {
                    this.$emit('update:modelValue', day);
                }
            } else {
                this.selectMultipleDates(day);
            }
        },

        /*
        * If both begin and end dates are set, reset the end date and set the begin date.
        * If only begin date is selected, emit an array of the begin date and the new date.
        * If not set, only set the begin date.
        */
        handleSelectRangeDate(date) {
            if (this.disabled) return
            if (this.selectedBeginDate && this.selectedEndDate) {
                this.selectedBeginDate = date;
                this.selectedEndDate = undefined;
                this.$emit('range-start', date);
            } else if (this.selectedBeginDate && !this.selectedEndDate) {
                if (this.selectedBeginDate > date) {
                    this.selectedEndDate = this.selectedBeginDate;
                    this.selectedBeginDate = date;
                } else {
                    this.selectedEndDate = date;
                }
                this.$emit('range-end', date);
                this.$emit('update:modelValue', [this.selectedBeginDate, this.selectedEndDate]);
            } else {
                this.selectedBeginDate = date;
                this.$emit('range-start', date);
            }
        },

        setRangeHoverEndDate(day) {
            if (this.range) {
                this.hoveredEndDate = day;
            }
        },

        changeFocus(month, inc) {
            const nextMonth = month;
            nextMonth.setMonth(month.getMonth() + inc);
            this.$emit('change-focus', nextMonth);
        }
    }
};

const _hoisted_1$x = { class: "datepicker-table" };
const _hoisted_2$s = { class: "datepicker-months" };
const _hoisted_3$i = ["disabled", "onClick", "onMouseenter", "onKeydown", "tabindex"];
const _hoisted_4$d = {
  key: 0,
  class: "events"
};

function render$C(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("section", _hoisted_1$x, [
    createElementVNode("div", {
      class: normalizeClass(["datepicker-body", {'has-events':$options.hasEvents}])
    }, [
      createElementVNode("div", _hoisted_2$s, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($options.monthDates, (date, index) => {
          return (openBlock(), createElementBlock(Fragment, { key: index }, [
            ($options.selectableDate(date) && !$props.disabled)
              ? (openBlock(), createElementBlock("a", {
                  key: 0,
                  ref_for: true,
                  ref: `month-${date.getMonth()}`,
                  class: normalizeClass([[
                            $options.classObject(date),
                            {'has-event': $options.eventsDateMatch(date)},
                            $props.indicators
                        ], "datepicker-cell"]),
                  role: "button",
                  href: "#",
                  disabled: $options.disabledOrUndefined,
                  onClick: withModifiers($event => ($options.updateSelectedDate(date)), ["prevent"]),
                  onMouseenter: $event => ($options.setRangeHoverEndDate(date)),
                  onKeydown: withModifiers($event => ($options.manageKeydown($event, date)), ["prevent"]),
                  tabindex: $props.focused.month === date.getMonth() ? null : -1
                }, [
                  createTextVNode(toDisplayString($props.monthNames[date.getMonth()]) + " ", 1 /* TEXT */),
                  ($options.eventsDateMatch(date))
                    ? (openBlock(), createElementBlock("div", _hoisted_4$d, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList($options.eventsDateMatch(date), (event, evIdx) => {
                          return (openBlock(), createElementBlock("div", {
                            class: normalizeClass(["event", event.type]),
                            key: evIdx
                          }, null, 2 /* CLASS */))
                        }), 128 /* KEYED_FRAGMENT */))
                      ]))
                    : createCommentVNode("v-if", true)
                ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_3$i))
              : (openBlock(), createElementBlock("div", {
                  key: 1,
                  class: normalizeClass([$options.classObject(date), "datepicker-cell"])
                }, toDisplayString($props.monthNames[date.getMonth()]), 3 /* TEXT, CLASS */))
          ], 64 /* STABLE_FRAGMENT */))
        }), 128 /* KEYED_FRAGMENT */))
      ])
    ], 2 /* CLASS */)
  ]))
}

script$I.render = render$C;
script$I.__file = "src/components/datepicker/DatepickerMonth.vue";

const defaultDateFormatter = (date, vm) => {
    const targetDates = Array.isArray(date) ? date : [date];
    const dates = targetDates.map((date) => {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
        return !vm.isTypeMonth ? vm.dtf.format(d) : vm.dtfMonth.format(d)
    });
    return !vm.multiple ? dates.join(' - ') : dates.join(', ')
};

const defaultDateParser = (date, vm) => {
    if (vm.dtf.formatToParts && typeof vm.dtf.formatToParts === 'function') {
        const formatRegex = (vm.isTypeMonth ? vm.dtfMonth : vm.dtf)
            .formatToParts(new Date(2000, 11, 25)).map((part) => {
                if (part.type === 'literal') {
                    return part.value
                }
                return `((?!=<${part.type}>)\\d+)`
            }).join('');
        const dateGroups = matchWithGroups(formatRegex, date);

        // We do a simple validation for the group.
        // If it is not valid, it will fallback to Date.parse below
        if (
            dateGroups.year &&
            dateGroups.year.length === 4 &&
            dateGroups.month &&
            dateGroups.month <= 12
        ) {
            if (vm.isTypeMonth) return new Date(dateGroups.year, dateGroups.month - 1)
            else if (dateGroups.day && dateGroups.day <= 31) {
                return new Date(dateGroups.year, dateGroups.month - 1, dateGroups.day, 12)
            }
        }
    }
    // Fallback if formatToParts is not supported or if we were not able to parse a valid date
    if (!vm.isTypeMonth) return new Date(Date.parse(date))
    if (date) {
        const s = date.split('/');
        const year = s[0].length === 4 ? s[0] : s[1];
        const month = s[0].length === 2 ? s[0] : s[1];
        if (year && month) {
            return new Date(parseInt(year, 10), parseInt(month - 1, 10), 1, 0, 0, 0, 0)
        }
    }
    return null
};

var script$H = {
    name: 'BDatepicker',
    components: {
        [script$J.name]: script$J,
        [script$I.name]: script$I,
        [script$16.name]: script$16,
        [script$T.name]: script$T,
        [script$Q.name]: script$Q,
        [script$17.name]: script$17,
        [script$W.name]: script$W,
        [script$V.name]: script$V
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    provide() {
        return {
            $datepicker: this
        }
    },
    props: {
        modelValue: {
            type: [Date, Array]
        },
        dayNames: {
            type: Array,
            default: () => {
                if (!Array.isArray(config.defaultDayNames)) {
                    return undefined
                }
                return config.defaultDayNames
            }
        },
        monthNames: {
            type: Array,
            default: () => {
                if (!Array.isArray(config.defaultMonthNames)) {
                    return undefined
                }
                return config.defaultMonthNames
            }
        },
        firstDayOfWeek: {
            type: Number,
            default: () => {
                if (typeof config.defaultFirstDayOfWeek === 'number') {
                    return config.defaultFirstDayOfWeek
                } else {
                    return 0
                }
            }
        },
        inline: Boolean,
        minDate: Date,
        maxDate: Date,
        focusedDate: Date,
        placeholder: String,
        editable: Boolean,
        disabled: Boolean,
        horizontalTimePicker: Boolean,
        unselectableDates: [Array, Function],
        unselectableDaysOfWeek: {
            type: Array,
            default: () => config.defaultUnselectableDaysOfWeek
        },
        selectableDates: [Array, Function],
        dateFormatter: {
            type: Function,
            default: (date, vm) => {
                if (typeof config.defaultDateFormatter === 'function') {
                    return config.defaultDateFormatter(date)
                } else {
                    return defaultDateFormatter(date, vm)
                }
            }
        },
        dateParser: {
            type: Function,
            default: (date, vm) => {
                if (typeof config.defaultDateParser === 'function') {
                    return config.defaultDateParser(date)
                } else {
                    return defaultDateParser(date, vm)
                }
            }
        },
        dateCreator: {
            type: Function,
            default: () => {
                if (typeof config.defaultDateCreator === 'function') {
                    return config.defaultDateCreator()
                } else {
                    return new Date()
                }
            }
        },
        mobileNative: {
            type: Boolean,
            default: () => config.defaultDatepickerMobileNative
        },
        position: String,
        iconRight: String,
        iconRightClickable: Boolean,
        events: Array,
        indicators: {
            type: String,
            default: 'dots'
        },
        openOnFocus: Boolean,
        iconPrev: {
            type: String,
            default: () => config.defaultIconPrev
        },
        iconNext: {
            type: String,
            default: () => config.defaultIconNext
        },
        yearsRange: {
            type: Array,
            default: () => config.defaultDatepickerYearsRange
        },
        type: {
            type: String,
            validator: (value) => {
                return [
                    'month'
                ].indexOf(value) >= 0
            }
        },
        nearbyMonthDays: {
            type: Boolean,
            default: () => config.defaultDatepickerNearbyMonthDays
        },
        nearbySelectableMonthDays: {
            type: Boolean,
            default: () => config.defaultDatepickerNearbySelectableMonthDays
        },
        showWeekNumber: {
            type: Boolean,
            default: () => config.defaultDatepickerShowWeekNumber
        },
        weekNumberClickable: {
            type: Boolean,
            default: () => config.defaultDatepickerWeekNumberClickable
        },
        rulesForFirstWeek: {
            type: Number,
            default: () => 4
        },
        range: {
            type: Boolean,
            default: false
        },
        closeOnClick: {
            type: Boolean,
            default: true
        },
        multiple: {
            type: Boolean,
            default: false
        },
        mobileModal: {
            type: Boolean,
            default: () => config.defaultDatepickerMobileModal
        },
        focusable: {
            type: Boolean,
            default: true
        },
        trapFocus: {
            type: Boolean,
            default: () => config.defaultTrapFocus
        },
        appendToBody: Boolean,
        ariaNextLabel: String,
        ariaPreviousLabel: String
    },
    emits: [
        'active-change',
        'change-month',
        'change-year',
        'icon-right-click',
        'range-end',
        'range-start',
        'update:modelValue',
        'week-number-click' // emitted from `DatepickerTableRow`
    ],
    data() {
        const focusedDate = (Array.isArray(this.modelValue)
            ? this.modelValue[0]
            : (this.modelValue)) || this.focusedDate || this.dateCreator();

        if (!this.modelValue &&
            this.maxDate &&
            this.maxDate.getFullYear() < focusedDate.getFullYear()) {
            focusedDate.setFullYear(this.maxDate.getFullYear());
        }

        return {
            dateSelected: this.modelValue,
            focusedDateData: {
                day: focusedDate.getDate(),
                month: focusedDate.getMonth(),
                year: focusedDate.getFullYear()
            },
            _elementRef: 'input',
            _isDatepicker: true
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.dateSelected
            },
            set(value) {
                this.updateInternalState(value);
                if (!this.multiple) this.togglePicker(false);
                this.$emit('update:modelValue', value);
                if (this.useHtml5Validation) {
                    this.$nextTick(() => {
                        this.checkHtml5Validity();
                    });
                }
            }
        },
        formattedValue() {
            return this.formatValue(this.computedValue)
        },
        localeOptions() {
            return new Intl.DateTimeFormat(this.locale, {
                year: 'numeric',
                month: 'numeric'
            }).resolvedOptions()
        },
        dtf() {
            return new Intl.DateTimeFormat(this.locale)
        },
        dtfMonth() {
            return new Intl.DateTimeFormat(this.locale, {
                year: this.localeOptions.year || 'numeric',
                month: this.localeOptions.month || '2-digit'
            })
        },
        newMonthNames() {
            if (Array.isArray(this.monthNames)) {
                return this.monthNames
            }
            return getMonthNames(this.locale)
        },
        newDayNames() {
            if (Array.isArray(this.dayNames)) {
                return this.dayNames
            }
            return getWeekdayNames(this.locale)
        },
        listOfMonths() {
            let minMonth = 0;
            let maxMonth = 12;
            if (this.minDate && this.focusedDateData.year === this.minDate.getFullYear()) {
                minMonth = this.minDate.getMonth();
            }
            if (this.maxDate && this.focusedDateData.year === this.maxDate.getFullYear()) {
                maxMonth = this.maxDate.getMonth();
            }
            return this.newMonthNames.map((name, index) => {
                return {
                    name: name,
                    index: index,
                    disabled: index < minMonth || index > maxMonth
                }
            })
        },
        /*
         * Returns an array of years for the year dropdown. If earliest/latest
         * dates are set by props, range of years will fall within those dates.
         */
        listOfYears() {
            let latestYear = this.focusedDateData.year + this.yearsRange[1];
            if (this.maxDate && this.maxDate.getFullYear() < latestYear) {
                latestYear = Math.max(this.maxDate.getFullYear(), this.focusedDateData.year);
            }

            let earliestYear = this.focusedDateData.year + this.yearsRange[0];
            if (this.minDate && this.minDate.getFullYear() > earliestYear) {
                earliestYear = Math.min(this.minDate.getFullYear(), this.focusedDateData.year);
            }

            const arrayOfYears = [];
            for (let i = earliestYear; i <= latestYear; i++) {
                arrayOfYears.push(i);
            }

            return arrayOfYears.reverse()
        },

        showPrev() {
            if (!this.minDate) return false
            if (this.isTypeMonth) {
                return this.focusedDateData.year <= this.minDate.getFullYear()
            }
            const dateToCheck = new Date(this.focusedDateData.year, this.focusedDateData.month);
            const date = new Date(this.minDate.getFullYear(), this.minDate.getMonth());
            return (dateToCheck <= date)
        },

        showNext() {
            if (!this.maxDate) return false
            if (this.isTypeMonth) {
                return this.focusedDateData.year >= this.maxDate.getFullYear()
            }
            const dateToCheck = new Date(this.focusedDateData.year, this.focusedDateData.month);
            const date = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth());
            return (dateToCheck >= date)
        },

        isMobile() {
            return this.mobileNative && isMobile.any()
        },

        isTypeMonth() {
            return this.type === 'month'
        },

        ariaRole() {
            if (!this.inline) {
                return 'dialog'
            } else {
                return undefined
            }
        },

        disabledOrUndefined() {
            // On Vue 3, setting a boolean attribute `false` does not remove it,
            // `null` or `undefined` has to be given to remove it.
            return this.disabled || undefined
        }
    },
    watch: {
        /**
         * When v-model is changed:
         *   1. Update internal value.
         *   2. If it's invalid, validate again.
         */
        modelValue(value) {
            this.updateInternalState(value);
            if (!this.multiple) this.togglePicker(false);
        },

        focusedDate(value) {
            if (value) {
                this.focusedDateData = {
                    day: value.getDate(),
                    month: value.getMonth(),
                    year: value.getFullYear()
                };
            }
        },

        /*
         * Emit input event on month and/or year change
         */
        'focusedDateData.month'(value) {
            this.$emit('change-month', value);
        },
        'focusedDateData.year'(value) {
            this.$emit('change-year', value);
        }
    },
    methods: {
        /*
         * Parse string into date
         */
        onChange(value) {
            const date = this.dateParser(value, this);
            if (date && (!isNaN(date) ||
                (Array.isArray(date) && date.length === 2 && !isNaN(date[0]) && !isNaN(date[1])))) {
                this.computedValue = date;
            } else {
                // Force refresh input value when not valid date
                this.computedValue = null;
                if (this.$refs.input) {
                    this.$refs.input.newValue = this.computedValue;
                }
            }
        },

        /*
         * Format date into string
         */
        formatValue(value) {
            if (Array.isArray(value)) {
                const isArrayWithValidDates = Array.isArray(value) && value.every((v) => !isNaN(v));
                return isArrayWithValidDates ? this.dateFormatter([...value], this) : null
            }
            return (value && !isNaN(value)) ? this.dateFormatter(value, this) : null
        },

        /*
         * Either decrement month by 1 if not January or decrement year by 1
         * and set month to 11 (December) or decrement year when 'month'
         */
        prev() {
            if (this.disabled) return

            if (this.isTypeMonth) {
                this.focusedDateData.year -= 1;
            } else {
                if (this.focusedDateData.month > 0) {
                    this.focusedDateData.month -= 1;
                } else {
                    this.focusedDateData.month = 11;
                    this.focusedDateData.year -= 1;
                }
            }
        },

        /*
         * Either increment month by 1 if not December or increment year by 1
         * and set month to 0 (January) or increment year when 'month'
         */
        next() {
            if (this.disabled) return

            if (this.isTypeMonth) {
                this.focusedDateData.year += 1;
            } else {
                if (this.focusedDateData.month < 11) {
                    this.focusedDateData.month += 1;
                } else {
                    this.focusedDateData.month = 0;
                    this.focusedDateData.year += 1;
                }
            }
        },

        formatNative(value) {
            return this.isTypeMonth
                ? this.formatYYYYMM(value)
                : this.formatYYYYMMDD(value)
        },

        /*
         * Format date into string 'YYYY-MM-DD'
         */
        formatYYYYMMDD(value) {
            const date = new Date(value);
            if (value && !isNaN(date)) {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return year + '-' +
                    ((month < 10 ? '0' : '') + month) + '-' +
                    ((day < 10 ? '0' : '') + day)
            }
            return ''
        },

        /*
         * Format date into string 'YYYY-MM'
         */
        formatYYYYMM(value) {
            const date = new Date(value);
            if (value && !isNaN(date)) {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                return year + '-' +
                    ((month < 10 ? '0' : '') + month)
            }
            return ''
        },

        /*
         * Parse date from string
         */
        onChangeNativePicker(event) {
            const date = event.target.value;
            const s = date ? date.split('-') : [];
            if (s.length === 3) {
                const year = parseInt(s[0], 10);
                const month = parseInt(s[1]) - 1;
                const day = parseInt(s[2]);
                this.computedValue = new Date(year, month, day);
            } else {
                this.computedValue = null;
            }
        },
        updateInternalState(value) {
            if (this.dateSelected === value) return
            const isArray = Array.isArray(value);
            const currentDate = isArray
                ? (!value.length ? this.dateCreator() : value[value.length - 1])
                : (!value ? this.dateCreator() : value);
            if (!isArray ||
                (isArray && this.dateSelected && value.length > this.dateSelected.length)) {
                this.focusedDateData = {
                    day: currentDate.getDate(),
                    month: currentDate.getMonth(),
                    year: currentDate.getFullYear()
                };
            }
            this.dateSelected = value;
        },

        /*
         * Toggle datepicker
         */
        togglePicker(active) {
            if (this.$refs.dropdown) {
                const isActive = typeof active === 'boolean'
                    ? active
                    : !this.$refs.dropdown.isActive;
                if (isActive) {
                    this.$refs.dropdown.isActive = isActive;
                } else if (this.closeOnClick) {
                    this.$refs.dropdown.isActive = isActive;
                }
            }
        },

        /*
         * Call default onFocus method and show datepicker
         */
        handleOnFocus(event) {
            this.onFocus(event);
            if (this.openOnFocus) {
                this.togglePicker(true);
            }
        },

        /*
         * Toggle dropdown
         */
        toggle() {
            if (this.mobileNative && this.isMobile) {
                const input = this.$refs.input.$refs.input;
                input.focus();
                input.click();
                return
            }
            this.$refs.dropdown.toggle();
        },

        /*
         * Avoid dropdown toggle when is already visible
         */
        onInputClick(event) {
            if (this.$refs.dropdown.isActive) {
                event.stopPropagation();
            }
        },

        /**
         * Keypress event that is bound to the document.
         */
        keyPress({ key }) {
            if (this.$refs.dropdown && this.$refs.dropdown.isActive && (key === 'Escape' || key === 'Esc')) {
                this.togglePicker(false);
            }
        },

        /**
         * Emit 'blur' event on dropdown is not active (closed)
         */
        onActiveChange(value) {
            if (!value) {
                this.onBlur();
            }
            /*
             * Emit 'active-change' when on dropdown active state change
             */
            this.$emit('active-change', value);
        },

        changeFocus(day) {
            this.focusedDateData = {
                day: day.getDate(),
                month: day.getMonth(),
                year: day.getFullYear()
            };
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keyup', this.keyPress);
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keyup', this.keyPress);
        }
    }
};

const _hoisted_1$w = { class: "datepicker-header" };
const _hoisted_2$r = ["disabled", "aria-label"];
const _hoisted_3$h = ["disabled", "aria-label"];
const _hoisted_4$c = { class: "pagination-list" };
const _hoisted_5$9 = ["value", "disabled"];
const _hoisted_6$6 = ["value"];
const _hoisted_7$6 = { key: 1 };

function render$B(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_input = resolveComponent("b-input");
  const _component_b_icon = resolveComponent("b-icon");
  const _component_b_select = resolveComponent("b-select");
  const _component_b_field = resolveComponent("b-field");
  const _component_b_datepicker_table = resolveComponent("b-datepicker-table");
  const _component_b_datepicker_month = resolveComponent("b-datepicker-month");
  const _component_b_dropdown_item = resolveComponent("b-dropdown-item");
  const _component_b_dropdown = resolveComponent("b-dropdown");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["datepicker control", [_ctx.size, {'is-expanded': _ctx.expanded}]])
  }, [
    (!$options.isMobile || $props.inline)
      ? (openBlock(), createBlock(_component_b_dropdown, {
          key: 0,
          ref: "dropdown",
          position: $props.position,
          disabled: $options.disabledOrUndefined,
          inline: $props.inline,
          "mobile-modal": $props.mobileModal,
          "trap-focus": $props.trapFocus,
          "aria-role": $options.ariaRole,
          "append-to-body": $props.appendToBody,
          "append-to-body-copy-parent": "",
          onActiveChange: $options.onActiveChange,
          "trigger-tabindex": -1
        }, createSlots({
          default: withCtx(() => [
            createVNode(_component_b_dropdown_item, {
              disabled: $options.disabledOrUndefined,
              focusable: $props.focusable,
              custom: "",
              class: normalizeClass({'dropdown-horizontal-timepicker': $props.horizontalTimePicker})
            }, {
              default: withCtx(() => [
                createElementVNode("div", null, [
                  createElementVNode("header", _hoisted_1$w, [
                    (_ctx.$slots.header !== undefined && _ctx.$slots.header().length)
                      ? renderSlot(_ctx.$slots, "header", { key: 0 })
                      : (openBlock(), createElementBlock("div", {
                          key: 1,
                          class: normalizeClass(["pagination field is-centered", _ctx.size])
                        }, [
                          withDirectives(createElementVNode("a", {
                            class: "pagination-previous",
                            role: "button",
                            href: "#",
                            disabled: $options.disabledOrUndefined,
                            "aria-label": $props.ariaPreviousLabel,
                            onClick: _cache[3] || (_cache[3] = withModifiers((...args) => ($options.prev && $options.prev(...args)), ["prevent"])),
                            onKeydown: [
                              _cache[4] || (_cache[4] = withKeys(withModifiers((...args) => ($options.prev && $options.prev(...args)), ["prevent"]), ["enter"])),
                              _cache[5] || (_cache[5] = withKeys(withModifiers((...args) => ($options.prev && $options.prev(...args)), ["prevent"]), ["space"]))
                            ]
                          }, [
                            createVNode(_component_b_icon, {
                              icon: $props.iconPrev,
                              pack: _ctx.iconPack,
                              both: "",
                              type: "is-primary is-clickable"
                            }, null, 8 /* PROPS */, ["icon", "pack"])
                          ], 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_2$r), [
                            [vShow, !$options.showPrev && !$props.disabled]
                          ]),
                          withDirectives(createElementVNode("a", {
                            class: "pagination-next",
                            role: "button",
                            href: "#",
                            disabled: $options.disabledOrUndefined,
                            "aria-label": $props.ariaNextLabel,
                            onClick: _cache[6] || (_cache[6] = withModifiers((...args) => ($options.next && $options.next(...args)), ["prevent"])),
                            onKeydown: [
                              _cache[7] || (_cache[7] = withKeys(withModifiers((...args) => ($options.next && $options.next(...args)), ["prevent"]), ["enter"])),
                              _cache[8] || (_cache[8] = withKeys(withModifiers((...args) => ($options.next && $options.next(...args)), ["prevent"]), ["space"]))
                            ]
                          }, [
                            createVNode(_component_b_icon, {
                              icon: $props.iconNext,
                              pack: _ctx.iconPack,
                              both: "",
                              type: "is-primary is-clickable"
                            }, null, 8 /* PROPS */, ["icon", "pack"])
                          ], 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_3$h), [
                            [vShow, !$options.showNext && !$props.disabled]
                          ]),
                          createElementVNode("div", _hoisted_4$c, [
                            createVNode(_component_b_field, null, {
                              default: withCtx(() => [
                                (!$options.isTypeMonth)
                                  ? (openBlock(), createBlock(_component_b_select, {
                                      key: 0,
                                      modelValue: $data.focusedDateData.month,
                                      "onUpdate:modelValue": _cache[9] || (_cache[9] = $event => (($data.focusedDateData.month) = $event)),
                                      disabled: $options.disabledOrUndefined,
                                      size: _ctx.size
                                    }, {
                                      default: withCtx(() => [
                                        (openBlock(true), createElementBlock(Fragment, null, renderList($options.listOfMonths, (month) => {
                                          return (openBlock(), createElementBlock("option", {
                                            value: month.index,
                                            key: month.name,
                                            disabled: month.disabled || undefined
                                          }, toDisplayString(month.name), 9 /* TEXT, PROPS */, _hoisted_5$9))
                                        }), 128 /* KEYED_FRAGMENT */))
                                      ]),
                                      _: 1 /* STABLE */
                                    }, 8 /* PROPS */, ["modelValue", "disabled", "size"]))
                                  : createCommentVNode("v-if", true),
                                createVNode(_component_b_select, {
                                  modelValue: $data.focusedDateData.year,
                                  "onUpdate:modelValue": _cache[10] || (_cache[10] = $event => (($data.focusedDateData.year) = $event)),
                                  disabled: $options.disabledOrUndefined,
                                  size: _ctx.size
                                }, {
                                  default: withCtx(() => [
                                    (openBlock(true), createElementBlock(Fragment, null, renderList($options.listOfYears, (year) => {
                                      return (openBlock(), createElementBlock("option", {
                                        value: year,
                                        key: year
                                      }, toDisplayString(year), 9 /* TEXT, PROPS */, _hoisted_6$6))
                                    }), 128 /* KEYED_FRAGMENT */))
                                  ]),
                                  _: 1 /* STABLE */
                                }, 8 /* PROPS */, ["modelValue", "disabled", "size"])
                              ]),
                              _: 1 /* STABLE */
                            })
                          ])
                        ], 2 /* CLASS */))
                  ]),
                  (!$options.isTypeMonth)
                    ? (openBlock(), createElementBlock("div", {
                        key: 0,
                        class: normalizeClass(["datepicker-content", {'content-horizontal-timepicker': $props.horizontalTimePicker}])
                      }, [
                        createVNode(_component_b_datepicker_table, {
                          modelValue: $options.computedValue,
                          "onUpdate:modelValue": _cache[11] || (_cache[11] = $event => (($options.computedValue) = $event)),
                          "day-names": $options.newDayNames,
                          "month-names": $options.newMonthNames,
                          "first-day-of-week": $props.firstDayOfWeek,
                          "rules-for-first-week": $props.rulesForFirstWeek,
                          "min-date": $props.minDate,
                          "max-date": $props.maxDate,
                          focused: $data.focusedDateData,
                          disabled: $options.disabledOrUndefined,
                          "unselectable-dates": $props.unselectableDates,
                          "unselectable-days-of-week": $props.unselectableDaysOfWeek,
                          "selectable-dates": $props.selectableDates,
                          events: $props.events,
                          indicators: $props.indicators,
                          "date-creator": $props.dateCreator,
                          "type-month": $options.isTypeMonth,
                          "nearby-month-days": $props.nearbyMonthDays,
                          "nearby-selectable-month-days": $props.nearbySelectableMonthDays,
                          "show-week-number": $props.showWeekNumber,
                          "week-number-clickable": $props.weekNumberClickable,
                          range: $props.range,
                          multiple: $props.multiple,
                          onRangeStart: _cache[12] || (_cache[12] = date => _ctx.$emit('range-start', date)),
                          onRangeEnd: _cache[13] || (_cache[13] = date => _ctx.$emit('range-end', date)),
                          onClose: _cache[14] || (_cache[14] = $event => ($options.togglePicker(false))),
                          "onUpdate:focused": _cache[15] || (_cache[15] = $event => ($data.focusedDateData = $event))
                        }, null, 8 /* PROPS */, ["modelValue", "day-names", "month-names", "first-day-of-week", "rules-for-first-week", "min-date", "max-date", "focused", "disabled", "unselectable-dates", "unselectable-days-of-week", "selectable-dates", "events", "indicators", "date-creator", "type-month", "nearby-month-days", "nearby-selectable-month-days", "show-week-number", "week-number-clickable", "range", "multiple"])
                      ], 2 /* CLASS */))
                    : (openBlock(), createElementBlock("div", _hoisted_7$6, [
                        createVNode(_component_b_datepicker_month, {
                          modelValue: $options.computedValue,
                          "onUpdate:modelValue": _cache[16] || (_cache[16] = $event => (($options.computedValue) = $event)),
                          "month-names": $options.newMonthNames,
                          "min-date": $props.minDate,
                          "max-date": $props.maxDate,
                          focused: $data.focusedDateData,
                          disabled: $options.disabledOrUndefined,
                          "unselectable-dates": $props.unselectableDates,
                          "unselectable-days-of-week": $props.unselectableDaysOfWeek,
                          "selectable-dates": $props.selectableDates,
                          events: $props.events,
                          indicators: $props.indicators,
                          "date-creator": $props.dateCreator,
                          range: $props.range,
                          multiple: $props.multiple,
                          onRangeStart: _cache[17] || (_cache[17] = date => _ctx.$emit('range-start', date)),
                          onRangeEnd: _cache[18] || (_cache[18] = date => _ctx.$emit('range-end', date)),
                          onClose: _cache[19] || (_cache[19] = $event => ($options.togglePicker(false))),
                          onChangeFocus: $options.changeFocus,
                          "onUpdate:focused": _cache[20] || (_cache[20] = $event => ($data.focusedDateData = $event))
                        }, null, 8 /* PROPS */, ["modelValue", "month-names", "min-date", "max-date", "focused", "disabled", "unselectable-dates", "unselectable-days-of-week", "selectable-dates", "events", "indicators", "date-creator", "range", "multiple", "onChangeFocus"])
                      ]))
                ]),
                (_ctx.$slots.default !== undefined && _ctx.$slots.default().length)
                  ? (openBlock(), createElementBlock("footer", {
                      key: 0,
                      class: normalizeClass(["datepicker-footer", {'footer-horizontal-timepicker': $props.horizontalTimePicker}])
                    }, [
                      renderSlot(_ctx.$slots, "default")
                    ], 2 /* CLASS */))
                  : createCommentVNode("v-if", true)
              ]),
              _: 3 /* FORWARDED */
            }, 8 /* PROPS */, ["disabled", "focusable", "class"])
          ]),
          _: 2 /* DYNAMIC */
        }, [
          (!$props.inline)
            ? {
                name: "trigger",
                fn: withCtx((props) => [
                  renderSlot(_ctx.$slots, "trigger", normalizeProps(guardReactiveProps(props)), () => [
                    createVNode(_component_b_input, mergeProps({
                      ref: "input",
                      autocomplete: "off",
                      "model-value": $options.formattedValue,
                      placeholder: $props.placeholder,
                      size: _ctx.size,
                      icon: _ctx.icon,
                      "icon-right": $props.iconRight,
                      "icon-right-clickable": $props.iconRightClickable,
                      "icon-pack": _ctx.iconPack,
                      rounded: _ctx.rounded,
                      loading: _ctx.loading,
                      disabled: $options.disabledOrUndefined,
                      readonly: !$props.editable
                    }, _ctx.$attrs, {
                      "use-html5-validation": false,
                      onClick: $options.onInputClick,
                      onIconRightClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('icon-right-click', $event))),
                      onKeyup: _cache[1] || (_cache[1] = withKeys($event => ($options.togglePicker(true)), ["enter"])),
                      onChange: _cache[2] || (_cache[2] = $event => ($options.onChange($event.target.value))),
                      onFocus: $options.handleOnFocus
                    }), null, 16 /* FULL_PROPS */, ["model-value", "placeholder", "size", "icon", "icon-right", "icon-right-clickable", "icon-pack", "rounded", "loading", "disabled", "readonly", "onClick", "onFocus"])
                  ])
                ]),
                key: "0"
              }
            : undefined
        ]), 1032 /* PROPS, DYNAMIC_SLOTS */, ["position", "disabled", "inline", "mobile-modal", "trap-focus", "aria-role", "append-to-body", "onActiveChange"]))
      : (openBlock(), createBlock(_component_b_input, mergeProps({
          key: 1,
          ref: "input",
          type: !$options.isTypeMonth ? 'date' : 'month',
          autocomplete: "off",
          "model-value": $options.formatNative($options.computedValue),
          placeholder: $props.placeholder,
          size: _ctx.size,
          icon: _ctx.icon,
          "icon-pack": _ctx.iconPack,
          rounded: _ctx.rounded,
          loading: _ctx.loading,
          max: $options.formatNative($props.maxDate),
          min: $options.formatNative($props.minDate),
          disabled: $options.disabledOrUndefined,
          readonly: false
        }, _ctx.$attrs, {
          "use-html5-validation": false,
          onChange: $options.onChangeNativePicker,
          onFocus: _ctx.onFocus,
          onBlur: _ctx.onBlur
        }), null, 16 /* FULL_PROPS */, ["type", "model-value", "placeholder", "size", "icon", "icon-pack", "rounded", "loading", "max", "min", "disabled", "onChange", "onFocus", "onBlur"]))
  ], 2 /* CLASS */))
}

script$H.render = render$B;
script$H.__file = "src/components/datepicker/Datepicker.vue";

var Plugin$12 = {
  install: function install(Vue) {
    registerComponent(Vue, script$H);
  }
};
use(Plugin$12);
var Plugin$13 = Plugin$12;

var script$G = {
    name: 'BTimepicker',
    components: {
        [script$16.name]: script$16,
        [script$T.name]: script$T,
        [script$Q.name]: script$Q,
        [script$17.name]: script$17,
        [script$W.name]: script$W,
        [script$V.name]: script$V
    },
    mixins: [TimepickerMixin],
    inheritAttrs: false,
    data() {
        return {
            _isTimepicker: true
        }
    },
    computed: {
        nativeStep() {
            if (this.enableSeconds) {
                return '1'
            } else {
                return undefined
            }
        }
    }
};

const _hoisted_1$v = ["value", "disabled"];
const _hoisted_2$q = { class: "control is-colon" };
const _hoisted_3$g = ["value", "disabled"];
const _hoisted_4$b = { class: "control is-colon" };
const _hoisted_5$8 = ["value", "disabled"];
const _hoisted_6$5 = { class: "control is-colon" };
const _hoisted_7$5 = ["value"];
const _hoisted_8$5 = {
  key: 0,
  class: "timepicker-footer"
};

function render$A(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_input = resolveComponent("b-input");
  const _component_b_select = resolveComponent("b-select");
  const _component_b_field = resolveComponent("b-field");
  const _component_b_dropdown_item = resolveComponent("b-dropdown-item");
  const _component_b_dropdown = resolveComponent("b-dropdown");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["timepicker control", [_ctx.size, {'is-expanded': _ctx.expanded}]])
  }, [
    (!_ctx.isMobile || _ctx.inline)
      ? (openBlock(), createBlock(_component_b_dropdown, {
          key: 0,
          ref: "dropdown",
          position: _ctx.position,
          disabled: _ctx.disabledOrUndefined,
          inline: _ctx.inline,
          "mobile-modal": _ctx.mobileModal,
          "append-to-body": _ctx.appendToBody,
          "append-to-body-copy-parent": "",
          onActiveChange: _ctx.onActiveChange
        }, createSlots({
          default: withCtx(() => [
            createVNode(_component_b_dropdown_item, {
              disabled: _ctx.disabledOrUndefined,
              focusable: _ctx.focusable,
              custom: ""
            }, {
              default: withCtx(() => [
                createVNode(_component_b_field, {
                  grouped: "",
                  position: "is-centered"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_b_select, {
                      modelValue: _ctx.hoursSelected,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((_ctx.hoursSelected) = $event)),
                      onChange: _cache[3] || (_cache[3] = $event => (_ctx.onHoursChange($event.target.value))),
                      disabled: _ctx.disabledOrUndefined,
                      placeholder: "00"
                    }, {
                      default: withCtx(() => [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.hours, (hour) => {
                          return (openBlock(), createElementBlock("option", {
                            value: hour.value,
                            key: hour.value,
                            disabled: _ctx.isHourDisabled(hour.value) || undefined
                          }, toDisplayString(hour.label), 9 /* TEXT, PROPS */, _hoisted_1$v))
                        }), 128 /* KEYED_FRAGMENT */))
                      ]),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["modelValue", "disabled"]),
                    createElementVNode("span", _hoisted_2$q, toDisplayString(_ctx.hourLiteral), 1 /* TEXT */),
                    createVNode(_component_b_select, {
                      modelValue: _ctx.minutesSelected,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => ((_ctx.minutesSelected) = $event)),
                      onChange: _cache[5] || (_cache[5] = $event => (_ctx.onMinutesChange($event.target.value))),
                      disabled: _ctx.disabledOrUndefined,
                      placeholder: "00"
                    }, {
                      default: withCtx(() => [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.minutes, (minute) => {
                          return (openBlock(), createElementBlock("option", {
                            value: minute.value,
                            key: minute.value,
                            disabled: _ctx.isMinuteDisabled(minute.value) || undefined
                          }, toDisplayString(minute.label), 9 /* TEXT, PROPS */, _hoisted_3$g))
                        }), 128 /* KEYED_FRAGMENT */))
                      ]),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["modelValue", "disabled"]),
                    (_ctx.enableSeconds)
                      ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                          createElementVNode("span", _hoisted_4$b, toDisplayString(_ctx.minuteLiteral), 1 /* TEXT */),
                          createVNode(_component_b_select, {
                            modelValue: _ctx.secondsSelected,
                            "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((_ctx.secondsSelected) = $event)),
                            onChange: _cache[7] || (_cache[7] = $event => (_ctx.onSecondsChange($event.target.value))),
                            disabled: _ctx.disabledOrUndefined,
                            placeholder: "00"
                          }, {
                            default: withCtx(() => [
                              (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.seconds, (second) => {
                                return (openBlock(), createElementBlock("option", {
                                  value: second.value,
                                  key: second.value,
                                  disabled: _ctx.isSecondDisabled(second.value) || undefined
                                }, toDisplayString(second.label), 9 /* TEXT, PROPS */, _hoisted_5$8))
                              }), 128 /* KEYED_FRAGMENT */))
                            ]),
                            _: 1 /* STABLE */
                          }, 8 /* PROPS */, ["modelValue", "disabled"]),
                          createElementVNode("span", _hoisted_6$5, toDisplayString(_ctx.secondLiteral), 1 /* TEXT */)
                        ], 64 /* STABLE_FRAGMENT */))
                      : createCommentVNode("v-if", true),
                    (!_ctx.isHourFormat24)
                      ? (openBlock(), createBlock(_component_b_select, {
                          key: 1,
                          modelValue: _ctx.meridienSelected,
                          "onUpdate:modelValue": _cache[8] || (_cache[8] = $event => ((_ctx.meridienSelected) = $event)),
                          onChange: _cache[9] || (_cache[9] = $event => (_ctx.onMeridienChange($event.target.value))),
                          disabled: _ctx.disabledOrUndefined
                        }, {
                          default: withCtx(() => [
                            (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.meridiens, (meridien) => {
                              return (openBlock(), createElementBlock("option", {
                                value: meridien,
                                key: meridien
                              }, toDisplayString(meridien), 9 /* TEXT, PROPS */, _hoisted_7$5))
                            }), 128 /* KEYED_FRAGMENT */))
                          ]),
                          _: 1 /* STABLE */
                        }, 8 /* PROPS */, ["modelValue", "disabled"]))
                      : createCommentVNode("v-if", true)
                  ]),
                  _: 1 /* STABLE */
                }),
                (_ctx.$slots.default !== undefined)
                  ? (openBlock(), createElementBlock("footer", _hoisted_8$5, [
                      renderSlot(_ctx.$slots, "default")
                    ]))
                  : createCommentVNode("v-if", true)
              ]),
              _: 3 /* FORWARDED */
            }, 8 /* PROPS */, ["disabled", "focusable"])
          ]),
          _: 2 /* DYNAMIC */
        }, [
          (!_ctx.inline)
            ? {
                name: "trigger",
                fn: withCtx(() => [
                  renderSlot(_ctx.$slots, "trigger", {}, () => [
                    createVNode(_component_b_input, mergeProps({
                      ref: "input",
                      autocomplete: "off",
                      "model-value": _ctx.formatValue(_ctx.computedValue),
                      placeholder: _ctx.placeholder,
                      size: _ctx.size,
                      icon: _ctx.icon,
                      "icon-pack": _ctx.iconPack,
                      loading: _ctx.loading,
                      disabled: _ctx.disabledOrUndefined,
                      readonly: !_ctx.editable || undefined,
                      rounded: _ctx.rounded
                    }, _ctx.$attrs, {
                      "use-html5-validation": _ctx.useHtml5Validation,
                      onKeyup: _cache[0] || (_cache[0] = withKeys($event => (_ctx.toggle(true)), ["enter"])),
                      onChange: _cache[1] || (_cache[1] = $event => (_ctx.onChange($event.target.value))),
                      onFocus: _ctx.handleOnFocus
                    }), null, 16 /* FULL_PROPS */, ["model-value", "placeholder", "size", "icon", "icon-pack", "loading", "disabled", "readonly", "rounded", "use-html5-validation", "onFocus"])
                  ])
                ]),
                key: "0"
              }
            : undefined
        ]), 1032 /* PROPS, DYNAMIC_SLOTS */, ["position", "disabled", "inline", "mobile-modal", "append-to-body", "onActiveChange"]))
      : (openBlock(), createBlock(_component_b_input, mergeProps({
          key: 1,
          ref: "input",
          type: "time",
          step: $options.nativeStep,
          autocomplete: "off",
          "model-value": _ctx.formatHHMMSS(_ctx.computedValue),
          placeholder: _ctx.placeholder,
          size: _ctx.size,
          icon: _ctx.icon,
          "icon-pack": _ctx.iconPack,
          rounded: _ctx.rounded,
          loading: _ctx.loading,
          max: _ctx.formatHHMMSS(_ctx.maxTime),
          min: _ctx.formatHHMMSS(_ctx.minTime),
          disabled: _ctx.disabledOrUndefined,
          readonly: false
        }, _ctx.$attrs, {
          "use-html5-validation": _ctx.useHtml5Validation,
          onChange: _cache[10] || (_cache[10] = $event => (_ctx.onChange($event.target.value))),
          onFocus: _ctx.handleOnFocus,
          onBlur: _cache[11] || (_cache[11] = $event => (_ctx.onBlur() && _ctx.checkHtml5Validity()))
        }), null, 16 /* FULL_PROPS */, ["step", "model-value", "placeholder", "size", "icon", "icon-pack", "rounded", "loading", "max", "min", "disabled", "use-html5-validation", "onFocus"]))
  ], 2 /* CLASS */))
}

script$G.render = render$A;
script$G.__file = "src/components/timepicker/Timepicker.vue";

const AM = 'AM';
const PM = 'PM';
var script$F = {
    name: 'BDatetimepicker',
    components: {
        [script$H.name]: script$H,
        [script$G.name]: script$G
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    props: {
        modelValue: {
            type: Date
        },
        editable: {
            type: Boolean,
            default: false
        },
        placeholder: String,
        horizontalTimePicker: Boolean,
        disabled: Boolean,
        firstDayOfWeek: {
            type: Number,
            default: () => {
                if (typeof config.defaultFirstDayOfWeek === 'number') {
                    return config.defaultFirstDayOfWeek
                } else {
                    return 0
                }
            }
        },
        rulesForFirstWeek: {
            type: Number,
            default: () => 4
        },
        icon: String,
        iconRight: String,
        iconRightClickable: Boolean,
        iconPack: String,
        inline: Boolean,
        openOnFocus: Boolean,
        position: String,
        mobileNative: {
            type: Boolean,
            default: true
        },
        minDatetime: Date,
        maxDatetime: Date,
        datetimeFormatter: {
            type: Function
        },
        datetimeParser: {
            type: Function
        },
        datetimeCreator: {
            type: Function,
            default: (date) => {
                if (typeof config.defaultDatetimeCreator === 'function') {
                    return config.defaultDatetimeCreator(date)
                } else {
                    return date
                }
            }
        },
        datepicker: Object,
        timepicker: Object,
        tzOffset: {
            type: Number,
            default: 0
        },
        focusable: {
            type: Boolean,
            default: true
        },
        appendToBody: Boolean
    },
    emits: [
        'active-change',
        'change-month',
        'change-year',
        'icon-right-click',
        'update:modelValue'
    ],
    data() {
        return {
            newValue: this.adjustValue(this.modelValue)
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.newValue
            },
            set(value) {
                if (value) {
                    let val = new Date(value.getTime());
                    if (this.newValue) {
                        // restore time part
                        if ((value.getDate() !== this.newValue.getDate() ||
                            value.getMonth() !== this.newValue.getMonth() ||
                            value.getFullYear() !== this.newValue.getFullYear()) &&
                            value.getHours() === 0 &&
                            value.getMinutes() === 0 &&
                            value.getSeconds() === 0) {
                            val.setHours(this.newValue.getHours(),
                                this.newValue.getMinutes(),
                                this.newValue.getSeconds(), 0);
                        }
                    } else {
                        val = this.datetimeCreator(value);
                    }
                    // check min and max range
                    if (this.minDatetime && val < this.adjustValue(this.minDatetime)) {
                        val = this.adjustValue(this.minDatetime);
                    } else if (this.maxDatetime && val > this.adjustValue(this.maxDatetime)) {
                        val = this.adjustValue(this.maxDatetime);
                    }
                    this.newValue = new Date(val.getTime());
                } else {
                    this.newValue = this.adjustValue(value);
                }
                const adjustedValue = this.adjustValue(this.newValue, true); // reverse adjust
                this.$emit('update:modelValue', adjustedValue);
            }
        },
        localeOptions() {
            return new Intl.DateTimeFormat(this.locale, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: this.enableSeconds() ? 'numeric' : undefined
            }).resolvedOptions()
        },
        dtf() {
            return new Intl.DateTimeFormat(this.locale, {
                year: this.localeOptions.year || 'numeric',
                month: this.localeOptions.month || 'numeric',
                day: this.localeOptions.day || 'numeric',
                hour: this.localeOptions.hour || 'numeric',
                minute: this.localeOptions.minute || 'numeric',
                second: this.enableSeconds() ? this.localeOptions.second || 'numeric' : undefined,
                hourCycle: !this.isHourFormat24() ? 'h12' : 'h23'
            })
        },
        isMobileNative() {
            return this.mobileNative && this.tzOffset === 0
        },
        isMobile() {
            return this.isMobileNative && isMobile.any()
        },
        minDate() {
            if (!this.minDatetime) {
                return this.datepicker ? this.adjustValue(this.datepicker.minDate) : null
            }
            const adjMinDatetime = this.adjustValue(this.minDatetime);
            return new Date(adjMinDatetime.getFullYear(),
                adjMinDatetime.getMonth(),
                adjMinDatetime.getDate(), 0, 0, 0, 0)
        },
        maxDate() {
            if (!this.maxDatetime) {
                return this.datepicker ? this.adjustValue(this.datepicker.maxDate) : null
            }
            const adjMaxDatetime = this.adjustValue(this.maxDatetime);
            return new Date(adjMaxDatetime.getFullYear(),
                adjMaxDatetime.getMonth(),
                adjMaxDatetime.getDate(), 0, 0, 0, 0)
        },
        minTime() {
            if (!this.minDatetime || (this.newValue === null || typeof this.newValue === 'undefined')) {
                return this.timepicker ? this.adjustValue(this.timepicker.minTime) : null
            }
            const adjMinDatetime = this.adjustValue(this.minDatetime);
            if (adjMinDatetime.getFullYear() === this.newValue.getFullYear() &&
                adjMinDatetime.getMonth() === this.newValue.getMonth() &&
                adjMinDatetime.getDate() === this.newValue.getDate()) {
                return adjMinDatetime
            }
            return undefined
        },
        maxTime() {
            if (!this.maxDatetime || (this.newValue === null || typeof this.newValue === 'undefined')) {
                return this.timepicker ? this.adjustValue(this.timepicker.maxTime) : null
            }
            const adjMaxDatetime = this.adjustValue(this.maxDatetime);
            if (adjMaxDatetime.getFullYear() === this.newValue.getFullYear() &&
                adjMaxDatetime.getMonth() === this.newValue.getMonth() &&
                adjMaxDatetime.getDate() === this.newValue.getDate()) {
                return adjMaxDatetime
            }
            return undefined
        },
        datepickerSize() {
            return this.datepicker && this.datepicker.size
                ? this.datepicker.size
                : this.size
        },
        timepickerSize() {
            return this.timepicker && this.timepicker.size
                ? this.timepicker.size
                : this.size
        },
        timepickerDisabled() {
            return this.timepicker && this.timepicker.disabled
                ? this.timepicker.disabled
                : this.disabled
        },

        disabledOrUndefined() {
            // On Vue 3, setting a boolean attribute `false` does not remove it,
            // `null` or `undefined` has to be given to remove it.
            return this.disabled || undefined
        }
    },
    watch: {
        modelValue() {
            this.newValue = this.adjustValue(this.modelValue);
        },
        tzOffset() {
            this.newValue = this.adjustValue(this.modelValue);
        }
    },
    methods: {
        enableSeconds() {
            if (this.$refs.timepicker) {
                return this.$refs.timepicker.enableSeconds
            }
            return false
        },
        isHourFormat24() {
            if (this.$refs.timepicker) {
                return this.$refs.timepicker.isHourFormat24
            }
            return !this.localeOptions.hour12
        },
        adjustValue(value, reverse = false) {
            if (!value) return value
            if (reverse) {
                return new Date(value.getTime() - this.tzOffset * 60000)
            } else {
                return new Date(value.getTime() + this.tzOffset * 60000)
            }
        },
        defaultDatetimeParser(date) {
            if (typeof this.datetimeParser === 'function') {
                return this.datetimeParser(date)
            } else if (typeof config.defaultDatetimeParser === 'function') {
                return config.defaultDatetimeParser(date)
            } else {
                if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
                    const dayPeriods = [AM, PM, AM.toLowerCase(), PM.toLowerCase()];
                    if (this.$refs.timepicker) {
                        dayPeriods.push(this.$refs.timepicker.amString);
                        dayPeriods.push(this.$refs.timepicker.pmString);
                    }
                    const parts = this.dtf.formatToParts(new Date());
                    const formatRegex = parts.map((part, idx) => {
                        if (part.type === 'literal') {
                            if (idx + 1 < parts.length && parts[idx + 1].type === 'hour') {
                                return '[^\\d]+'
                            }
                            return part.value.replace(/ /g, '\\s?')
                        } else if (part.type === 'dayPeriod') {
                            return `((?!=<${part.type}>)(${dayPeriods.join('|')})?)`
                        }
                        return `((?!=<${part.type}>)\\d+)`
                    }).join('');
                    const datetimeGroups = matchWithGroups(formatRegex, date);

                    // We do a simple validation for the group.
                    // If it is not valid, it will fallback to Date.parse below
                    if (
                        datetimeGroups.year &&
                        datetimeGroups.year.length === 4 &&
                        datetimeGroups.month &&
                        datetimeGroups.month <= 12 &&
                        datetimeGroups.day &&
                        datetimeGroups.day <= 31 &&
                        datetimeGroups.hour &&
                        datetimeGroups.hour >= 0 &&
                        datetimeGroups.hour < 24 &&
                        datetimeGroups.minute &&
                        datetimeGroups.minute >= 0 &&
                        datetimeGroups.minute <= 59
                    ) {
                        const d = new Date(
                            datetimeGroups.year,
                            datetimeGroups.month - 1,
                            datetimeGroups.day,
                            datetimeGroups.hour,
                            datetimeGroups.minute,
                            datetimeGroups.second || 0);
                        return d
                    }
                }

                return new Date(Date.parse(date))
            }
        },
        defaultDatetimeFormatter(date) {
            if (typeof this.datetimeFormatter === 'function') {
                return this.datetimeFormatter(date)
            } else if (typeof config.defaultDatetimeFormatter === 'function') {
                return config.defaultDatetimeFormatter(date)
            } else {
                return this.dtf.format(date)
            }
        },
        /*
        * Parse date from string
        */
        onChangeNativePicker(event) {
            const date = event.target.value;
            const s = date ? date.split(/\D/) : [];
            if (s.length >= 5) {
                const year = parseInt(s[0], 10);
                const month = parseInt(s[1], 10) - 1;
                const day = parseInt(s[2], 10);
                const hours = parseInt(s[3], 10);
                const minutes = parseInt(s[4], 10);
                // Seconds are omitted intentionally; they are unsupported by input
                // type=datetime-local and cause the control to fail native validation
                this.computedValue = new Date(year, month, day, hours, minutes);
            } else {
                this.computedValue = null;
            }
        },
        /*
         * Emit 'active-change' on datepicker active state change
         */
        onActiveChange(value) {
            this.$emit('active-change', value);
        },
        formatNative(value) {
            const date = new Date(value);
            if (value && !isNaN(date)) {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                return year + '-' +
                    ((month < 10 ? '0' : '') + month) + '-' +
                    ((day < 10 ? '0' : '') + day) + 'T' +
                    ((hours < 10 ? '0' : '') + hours) + ':' +
                    ((minutes < 10 ? '0' : '') + minutes) + ':' +
                    ((seconds < 10 ? '0' : '') + seconds)
            }
            return ''
        },
        toggle() {
            this.$refs.datepicker.toggle();
        }
    },
    mounted() {
        if (!this.isMobile || this.inline) {
            // $refs attached, it's time to refresh datepicker (input)
            if (this.newValue) {
                this.$refs.datepicker.$forceUpdate();
            }
        }
    }
};

const _hoisted_1$u = { class: "level is-mobile" };
const _hoisted_2$p = {
  key: 0,
  class: "level-item has-text-centered"
};
const _hoisted_3$f = { class: "level-item has-text-centered" };
const _hoisted_4$a = {
  key: 1,
  class: "level-item has-text-centered"
};

function render$z(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_timepicker = resolveComponent("b-timepicker");
  const _component_b_datepicker = resolveComponent("b-datepicker");
  const _component_b_input = resolveComponent("b-input");

  return (!$options.isMobile || $props.inline)
    ? (openBlock(), createBlock(_component_b_datepicker, mergeProps({
        key: 0,
        ref: "datepicker",
        modelValue: $options.computedValue,
        "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($options.computedValue) = $event))
      }, $props.datepicker, {
        rounded: _ctx.rounded,
        "open-on-focus": $props.openOnFocus,
        position: $props.position,
        loading: _ctx.loading,
        inline: $props.inline,
        editable: $props.editable,
        expanded: _ctx.expanded,
        "close-on-click": false,
        "first-day-of-week": $props.firstDayOfWeek,
        "rules-for-first-week": $props.rulesForFirstWeek,
        "date-formatter": $options.defaultDatetimeFormatter,
        "date-parser": $options.defaultDatetimeParser,
        "min-date": $options.minDate,
        "max-date": $options.maxDate,
        icon: $props.icon,
        "icon-right": $props.iconRight,
        "icon-right-clickable": $props.iconRightClickable,
        "icon-pack": $props.iconPack,
        size: $options.datepickerSize,
        placeholder: $props.placeholder,
        "horizontal-time-picker": $props.horizontalTimePicker,
        range: false,
        disabled: $options.disabledOrUndefined,
        "mobile-native": $options.isMobileNative,
        locale: _ctx.locale,
        focusable: $props.focusable,
        "append-to-body": $props.appendToBody,
        onFocus: _ctx.onFocus,
        onBlur: _ctx.onBlur,
        onActiveChange: $options.onActiveChange,
        onIconRightClick: _cache[2] || (_cache[2] = $event => (_ctx.$emit('icon-right-click'))),
        onChangeMonth: _cache[3] || (_cache[3] = $event => (_ctx.$emit('change-month', $event))),
        onChangeYear: _cache[4] || (_cache[4] = $event => (_ctx.$emit('change-year', $event)))
      }), {
        default: withCtx(() => [
          createElementVNode("nav", _hoisted_1$u, [
            (_ctx.$slots.left !== undefined)
              ? (openBlock(), createElementBlock("div", _hoisted_2$p, [
                  renderSlot(_ctx.$slots, "left")
                ]))
              : createCommentVNode("v-if", true),
            createElementVNode("div", _hoisted_3$f, [
              createVNode(_component_b_timepicker, mergeProps({ ref: "timepicker" }, $props.timepicker, {
                modelValue: $options.computedValue,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($options.computedValue) = $event)),
                inline: "",
                editable: $props.editable,
                "min-time": $options.minTime,
                "max-time": $options.maxTime,
                size: $options.timepickerSize,
                disabled: $options.timepickerDisabled || undefined,
                focusable: $props.focusable,
                "mobile-native": $options.isMobileNative,
                locale: _ctx.locale
              }), null, 16 /* FULL_PROPS */, ["modelValue", "editable", "min-time", "max-time", "size", "disabled", "focusable", "mobile-native", "locale"])
            ]),
            (_ctx.$slots.right !== undefined)
              ? (openBlock(), createElementBlock("div", _hoisted_4$a, [
                  renderSlot(_ctx.$slots, "right")
                ]))
              : createCommentVNode("v-if", true)
          ])
        ]),
        _: 3 /* FORWARDED */
      }, 16 /* FULL_PROPS */, ["modelValue", "rounded", "open-on-focus", "position", "loading", "inline", "editable", "expanded", "first-day-of-week", "rules-for-first-week", "date-formatter", "date-parser", "min-date", "max-date", "icon", "icon-right", "icon-right-clickable", "icon-pack", "size", "placeholder", "horizontal-time-picker", "disabled", "mobile-native", "locale", "focusable", "append-to-body", "onFocus", "onBlur", "onActiveChange"]))
    : (openBlock(), createBlock(_component_b_input, mergeProps({
        key: 1,
        ref: "input",
        type: "datetime-local",
        autocomplete: "off",
        "model-value": $options.formatNative($options.computedValue),
        placeholder: $props.placeholder,
        size: _ctx.size,
        icon: $props.icon,
        "icon-pack": $props.iconPack,
        rounded: _ctx.rounded,
        loading: _ctx.loading,
        max: $options.formatNative($options.maxDate),
        min: $options.formatNative($options.minDate),
        disabled: $options.disabledOrUndefined,
        readonly: false
      }, _ctx.$attrs, {
        "use-html5-validation": _ctx.useHtml5Validation,
        onChange: $options.onChangeNativePicker,
        onFocus: _ctx.onFocus,
        onBlur: _ctx.onBlur
      }), null, 16 /* FULL_PROPS */, ["model-value", "placeholder", "size", "icon", "icon-pack", "rounded", "loading", "max", "min", "disabled", "use-html5-validation", "onChange", "onFocus", "onBlur"]))
}

script$F.render = render$z;
script$F.__file = "src/components/datetimepicker/Datetimepicker.vue";

var Plugin$10 = {
  install: function install(Vue) {
    registerComponent(Vue, script$F);
  }
};
use(Plugin$10);
var Plugin$11 = Plugin$10;

var script$E = {
    name: 'BModal',
    directives: {
        trapFocus
    },
    props: {
        modelValue: Boolean,
        component: [Object, Function, String],
        content: [String, Array],
        programmatic: Boolean,
        props: Object,
        events: Object,
        width: {
            type: [String, Number],
            default: 960
        },
        hasModalCard: Boolean,
        animation: {
            type: String,
            default: 'zoom-out'
        },
        canCancel: {
            type: [Array, Boolean],
            default: () => {
                return config.defaultModalCanCancel
            }
        },
        cancelCallback: {
            type: Function,
            default: () => {}
        },
        scroll: {
            type: String,
            default: () => {
                return config.defaultModalScroll
                    ? config.defaultModalScroll
                    : 'clip'
            },
            validator: (value) => {
                return [
                    'clip',
                    'keep'
                ].indexOf(value) >= 0
            }
        },
        fullScreen: Boolean,
        trapFocus: {
            type: Boolean,
            default: () => {
                return config.defaultTrapFocus
            }
        },
        autoFocus: {
            type: Boolean,
            default: () => {
                return config.defaultAutoFocus
            }
        },
        customClass: String,
        customContentClass: [String, Array, Object],
        ariaRole: {
            type: String,
            validator: (value) => {
                return [
                    'dialog',
                    'alertdialog'
                ].indexOf(value) >= 0
            }
        },
        ariaModal: Boolean,
        ariaLabel: {
            type: String,
            validator: (value) => {
                return Boolean(value)
            }
        },
        closeButtonAriaLabel: String,
        destroyOnHide: {
            type: Boolean,
            default: true
        }
    },
    emits: [
        'after-enter',
        'after-leave',
        'cancel',
        'close',
        'update:modelValue'
    ],
    data() {
        return {
            isActive: this.modelValue || false,
            savedScrollTop: null,
            newWidth: typeof this.width === 'number'
                ? this.width + 'px'
                : this.width,
            animating: !this.modelValue,
            destroyed: !this.modelValue
        }
    },
    computed: {
        cancelOptions() {
            return typeof this.canCancel === 'boolean'
                ? this.canCancel
                    ? config.defaultModalCanCancel
                    : []
                : this.canCancel
        },
        showX() {
            return this.cancelOptions.indexOf('x') >= 0
        },
        customStyle() {
            if (!this.fullScreen) {
                return { maxWidth: this.newWidth }
            }
            return null
        }
    },
    watch: {
        modelValue(value) {
            this.isActive = value;
        },
        isActive(value) {
            if (value) this.destroyed = false;
            this.handleScroll();
            this.$nextTick(() => {
                if (value && this.$el && this.$el.focus && this.autoFocus) {
                    this.$el.focus();
                }
            });
        }
    },
    methods: {
        handleScroll() {
            if (typeof window === 'undefined') return

            if (this.scroll === 'clip') {
                if (this.isActive) {
                    document.documentElement.classList.add('is-clipped');
                } else {
                    document.documentElement.classList.remove('is-clipped');
                }
                return
            }

            this.savedScrollTop = !this.savedScrollTop
                ? document.documentElement.scrollTop
                : this.savedScrollTop;

            if (this.isActive) {
                document.body.classList.add('is-noscroll');
            } else {
                document.body.classList.remove('is-noscroll');
            }

            if (this.isActive) {
                document.body.style.top = `-${this.savedScrollTop}px`;
                return
            }

            document.documentElement.scrollTop = this.savedScrollTop;
            document.body.style.top = null;
            this.savedScrollTop = null;
        },

        /**
        * Close the Modal if canCancel and call the cancelCallback prop (function).
        */
        cancel(method) {
            if (this.cancelOptions.indexOf(method) < 0) return
            this.$emit('cancel', arguments);
            this.cancelCallback.apply(null, arguments);
            this.close();
        },

        /**
        * Call the cancelCallback prop (function).
        * Emit events, and destroy modal if it's programmatic.
        */
        close() {
            this.$emit('close');
            this.$emit('update:modelValue', false);

            // Timeout for the animation complete before destroying
            if (this.programmatic) {
                this.isActive = false;
                setTimeout(() => {
                    removeElement(this.$el);
                }, 150);
            }
        },

        /**
        * Keypress event that is bound to the document.
        */
        keyPress({ key }) {
            if (this.isActive && (key === 'Escape' || key === 'Esc')) this.cancel('escape');
        },

        /**
        * Transition after-enter hook
        */
        afterEnter() {
            this.animating = false;
            this.$emit('after-enter');
        },

        /**
        * Transition before-leave hook
        */
        beforeLeave() {
            this.animating = true;
        },

        /**
        * Transition after-leave hook
        */
        afterLeave() {
            if (this.destroyOnHide) {
                this.destroyed = true;
            }
            this.$emit('after-leave');
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keyup', this.keyPress);
        }
    },
    mounted() {
        if (this.programmatic) {
            // Insert the Modal component in body tag
            // only if it's programmatic
            // the following line used be in `beforeMount`
            // but $el is null at `beforeMount`
            document.body.appendChild(this.$el);
            this.isActive = true;
        } else if (this.isActive) this.handleScroll();
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keyup', this.keyPress);
            // reset scroll
            document.documentElement.classList.remove('is-clipped');
            const savedScrollTop = !this.savedScrollTop
                ? document.documentElement.scrollTop
                : this.savedScrollTop;
            document.body.classList.remove('is-noscroll');
            document.documentElement.scrollTop = savedScrollTop;
            document.body.style.top = null;
        }
    }
};

const _hoisted_1$t = ["role", "aria-label", "aria-modal"];
const _hoisted_2$o = ["innerHTML"];
const _hoisted_3$e = ["aria-label"];

function render$y(_ctx, _cache, $props, $setup, $data, $options) {
  const _directive_trap_focus = resolveDirective("trap-focus");

  return (openBlock(), createBlock(Transition, {
    name: $props.animation,
    onAfterEnter: $options.afterEnter,
    onBeforeLeave: $options.beforeLeave,
    onAfterLeave: $options.afterLeave
  }, {
    default: withCtx(() => [
      (!$data.destroyed)
        ? withDirectives((openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(["modal is-active", [{'is-full-screen': $props.fullScreen}, $props.customClass]]),
            tabindex: "-1",
            role: $props.ariaRole,
            "aria-label": $props.ariaLabel,
            "aria-modal": $props.ariaModal
          }, [
            createElementVNode("div", {
              class: "modal-background",
              onClick: _cache[0] || (_cache[0] = $event => ($options.cancel('outside')))
            }),
            createElementVNode("div", {
              class: normalizeClass(["animation-content", [{ 'modal-content': !$props.hasModalCard }, $props.customContentClass]]),
              style: normalizeStyle($options.customStyle)
            }, [
              ($props.component)
                ? (openBlock(), createBlock(resolveDynamicComponent($props.component), mergeProps({ key: 0 }, $props.props, toHandlers($props.events), {
                    "can-cancel": $props.canCancel,
                    onClose: $options.close
                  }), null, 16 /* FULL_PROPS */, ["can-cancel", "onClose"]))
                : ($props.content)
                  ? (openBlock(), createElementBlock("div", {
                      key: 1,
                      innerHTML: $props.content
                    }, null, 8 /* PROPS */, _hoisted_2$o))
                  : renderSlot(_ctx.$slots, "default", {
                      key: 2,
                      canCancel: $props.canCancel,
                      close: $options.close
                    }),
              ($options.showX)
                ? withDirectives((openBlock(), createElementBlock("button", {
                    key: 3,
                    type: "button",
                    class: "modal-close is-large",
                    "aria-label": $props.closeButtonAriaLabel,
                    onClick: _cache[1] || (_cache[1] = $event => ($options.cancel('x')))
                  }, null, 8 /* PROPS */, _hoisted_3$e)), [
                    [vShow, !$data.animating]
                  ])
                : createCommentVNode("v-if", true)
            ], 6 /* CLASS, STYLE */)
          ], 10 /* CLASS, PROPS */, _hoisted_1$t)), [
            [vShow, $data.isActive],
            [_directive_trap_focus, $props.trapFocus]
          ])
        : createCommentVNode("v-if", true)
    ]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["name", "onAfterEnter", "onBeforeLeave", "onAfterLeave"]))
}

script$E.render = render$y;
script$E.__file = "src/components/modal/Modal.vue";

var script$D = {
    name: 'BDialog',
    components: {
        [script$17.name]: script$17,
        [script$12.name]: script$12
    },
    directives: {
        trapFocus
    },
    extends: script$E,
    props: {
        title: String,
        message: [String, Array],
        icon: String,
        iconPack: String,
        hasIcon: Boolean,
        type: {
            type: String,
            default: 'is-primary'
        },
        size: String,
        confirmText: {
            type: String,
            default: () => {
                return config.defaultDialogConfirmText
                    ? config.defaultDialogConfirmText
                    : 'OK'
            }
        },
        cancelText: {
            type: String,
            default: () => {
                return config.defaultDialogCancelText
                    ? config.defaultDialogCancelText
                    : 'Cancel'
            }
        },
        hasInput: Boolean, // Used internally to know if it's prompt
        inputAttrs: {
            type: Object,
            default: () => ({})
        },
        confirmCallback: {
            type: Function,
            default: () => {}
        },
        closeOnConfirm: {
            type: Boolean,
            default: true
        },
        container: {
            type: String,
            default: () => {
                return config.defaultContainerElement
            }
        },
        focusOn: {
            type: String,
            default: 'confirm'
        },
        trapFocus: {
            type: Boolean,
            default: () => {
                return config.defaultTrapFocus
            }
        },
        ariaRole: {
            type: String,
            validator: (value) => {
                return [
                    'dialog',
                    'alertdialog'
                ].indexOf(value) >= 0
            }
        },
        ariaModal: Boolean
    },
    emits: ['confirm'],
    data() {
        const prompt = this.hasInput
            ? this.inputAttrs.value || ''
            : '';

        return {
            prompt,
            isActive: false,
            validationMessage: '',
            isCompositing: false
        }
    },
    computed: {
        // `safeInputAttrs` is a shallow copy of `inputAttrs` except for `value`
        // `value` should not be specified to `v-bind` of the input element
        // because it inhibits `v-model` of the input on Vue 3
        safeInputAttrs() {
            const attrs = { ...this.inputAttrs };
            delete attrs.value;
            if (typeof attrs.required === 'undefined') {
                attrs.required = true;
            }
            return attrs
        },
        dialogClass() {
            return [this.size, {
                'has-custom-container': this.container !== null
            }]
        },
        /**
        * Icon name (MDI) based on the type.
        */
        iconByType() {
            switch (this.type) {
                case 'is-info':
                    return 'information'
                case 'is-success':
                    return 'check-circle'
                case 'is-warning':
                    return 'alert'
                case 'is-danger':
                    return 'alert-circle'
                default:
                    return null
            }
        },
        showCancel() {
            return this.cancelOptions.indexOf('button') >= 0
        }
    },
    methods: {
        /**
        * If it's a prompt Dialog, validate the input.
        * Call the confirmCallback prop (function) and close the Dialog.
        */
        confirm() {
            if (this.$refs.input !== undefined) {
                if (this.isCompositing) return
                if (!this.$refs.input.checkValidity()) {
                    this.validationMessage = this.$refs.input.validationMessage;
                    this.$nextTick(() => this.$refs.input.select());
                    return
                }
            }
            this.$emit('confirm', this.prompt);
            this.confirmCallback(this.prompt, this);
            if (this.closeOnConfirm) this.close();
        },

        /**
        * Close the Dialog.
        */
        close() {
            this.isActive = false;
            // Timeout for the animation complete before destroying
            setTimeout(() => {
                removeElement(this.$el);
            }, 150);
        }
    },
    beforeMount() {
        // Insert the Dialog component in the element container
        if (typeof window !== 'undefined') {
            this.$nextTick(() => {
                const container = document.querySelector(this.container) || document.body;
                container.appendChild(this.$el);
            });
        }
    },
    mounted() {
        this.isActive = true;

        this.$nextTick(() => {
            // Handle which element receives focus
            if (this.hasInput) {
                this.$refs.input.focus();
            } else if (this.focusOn === 'cancel' && this.showCancel) {
                this.$refs.cancelButton.$el.focus();
            } else {
                this.$refs.confirmButton.$el.focus();
            }
        });
    }
};

const _hoisted_1$s = ["role", "aria-modal"];
const _hoisted_2$n = { class: "modal-card animation-content" };
const _hoisted_3$d = {
  key: 0,
  class: "modal-card-head"
};
const _hoisted_4$9 = { class: "modal-card-title" };
const _hoisted_5$7 = { class: "media" };
const _hoisted_6$4 = {
  key: 0,
  class: "media-left"
};
const _hoisted_7$4 = { class: "media-content" };
const _hoisted_8$4 = ["innerHTML"];
const _hoisted_9$3 = {
  key: 0,
  class: "field"
};
const _hoisted_10$2 = { class: "control" };
const _hoisted_11$2 = { class: "help is-danger" };
const _hoisted_12$2 = { class: "modal-card-foot" };

function render$x(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");
  const _component_b_button = resolveComponent("b-button");
  const _directive_trap_focus = resolveDirective("trap-focus");

  return (openBlock(), createBlock(Transition, { name: _ctx.animation }, {
    default: withCtx(() => [
      ($data.isActive)
        ? withDirectives((openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(["dialog modal is-active", $options.dialogClass]),
            role: $props.ariaRole,
            "aria-modal": $props.ariaModal
          }, [
            createElementVNode("div", {
              class: "modal-background",
              onClick: _cache[0] || (_cache[0] = $event => (_ctx.cancel('outside')))
            }),
            createElementVNode("div", _hoisted_2$n, [
              ($props.title)
                ? (openBlock(), createElementBlock("header", _hoisted_3$d, [
                    createElementVNode("p", _hoisted_4$9, toDisplayString($props.title), 1 /* TEXT */)
                  ]))
                : createCommentVNode("v-if", true),
              createElementVNode("section", {
                class: normalizeClass(["modal-card-body", { 'is-titleless': !$props.title, 'is-flex': $props.hasIcon }])
              }, [
                createElementVNode("div", _hoisted_5$7, [
                  ($props.hasIcon && ($props.icon || $options.iconByType))
                    ? (openBlock(), createElementBlock("div", _hoisted_6$4, [
                        createVNode(_component_b_icon, {
                          icon: $props.icon ? $props.icon : $options.iconByType,
                          pack: $props.iconPack,
                          type: $props.type,
                          both: !$props.icon,
                          size: "is-large"
                        }, null, 8 /* PROPS */, ["icon", "pack", "type", "both"])
                      ]))
                    : createCommentVNode("v-if", true),
                  createElementVNode("div", _hoisted_7$4, [
                    createElementVNode("p", null, [
                      (_ctx.$slots.default)
                        ? renderSlot(_ctx.$slots, "default", { key: 0 })
                        : (openBlock(), createElementBlock("div", {
                            key: 1,
                            innerHTML: $props.message
                          }, null, 8 /* PROPS */, _hoisted_8$4))
                    ]),
                    ($props.hasInput)
                      ? (openBlock(), createElementBlock("div", _hoisted_9$3, [
                          createElementVNode("div", _hoisted_10$2, [
                            withDirectives(createElementVNode("input", mergeProps({
                              "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($data.prompt) = $event)),
                              class: ["input", { 'is-danger': $data.validationMessage }],
                              ref: "input"
                            }, $options.safeInputAttrs, {
                              onCompositionstart: _cache[2] || (_cache[2] = $event => ($data.isCompositing = true)),
                              onCompositionend: _cache[3] || (_cache[3] = $event => ($data.isCompositing = false)),
                              onKeydown: _cache[4] || (_cache[4] = withKeys((...args) => ($options.confirm && $options.confirm(...args)), ["enter"]))
                            }), null, 16 /* FULL_PROPS */), [
                              [vModelDynamic, $data.prompt]
                            ])
                          ]),
                          createElementVNode("p", _hoisted_11$2, toDisplayString($data.validationMessage), 1 /* TEXT */)
                        ]))
                      : createCommentVNode("v-if", true)
                  ])
                ])
              ], 2 /* CLASS */),
              createElementVNode("footer", _hoisted_12$2, [
                ($options.showCancel)
                  ? (openBlock(), createBlock(_component_b_button, {
                      key: 0,
                      ref: "cancelButton",
                      onClick: _cache[5] || (_cache[5] = $event => (_ctx.cancel('button')))
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString($props.cancelText), 1 /* TEXT */)
                      ]),
                      _: 1 /* STABLE */
                    }, 512 /* NEED_PATCH */))
                  : createCommentVNode("v-if", true),
                createVNode(_component_b_button, {
                  type: $props.type,
                  ref: "confirmButton",
                  onClick: $options.confirm
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString($props.confirmText), 1 /* TEXT */)
                  ]),
                  _: 1 /* STABLE */
                }, 8 /* PROPS */, ["type", "onClick"])
              ])
            ])
          ], 10 /* CLASS, PROPS */, _hoisted_1$s)), [
            [_directive_trap_focus, $props.trapFocus]
          ])
        : createCommentVNode("v-if", true)
    ]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["name"]))
}

script$D.render = render$x;
script$D.__file = "src/components/dialog/Dialog.vue";

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$7(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function open(propsData) {
  var slot;
  if (Array.isArray(propsData.message)) {
    slot = propsData.message;
    delete propsData.message;
  }
  function createDialog(_onConfirm, _onCancel) {
    var container = document.createElement('div');
    var vueInstance = createApp({
      data: function data() {
        return {
          dialogVNode: null
        };
      },
      methods: {
        close: function close() {
          var dialog = getComponentFromVNode(this.dialogVNode);
          if (dialog) {
            dialog.close();
          }
        }
      },
      render: function render() {
        this.dialogVNode = h(script$D, _objectSpread$7(_objectSpread$7({}, propsData), {}, {
          // intentionally overrides propsData.onConfirm
          // to prevent propsData.onConfirm from receiving a "confirm" event
          onConfirm: function onConfirm() {
            if (_onConfirm != null) {
              _onConfirm.apply(void 0, arguments);
            }
          },
          // intentionally override propsData.onCancel
          // to prevent propsData.onCancel from receiving a "cancel" event
          onCancel: function onCancel() {
            if (_onCancel != null) {
              _onCancel.apply(void 0, arguments);
            }
            vueInstance.unmount();
          },
          confirmCallback: function confirmCallback() {
            if (propsData.onConfirm != null) {
              propsData.onConfirm.apply(propsData, arguments);
            }
          },
          cancelCallback: function cancelCallback() {
            if (propsData.onCancel != null) {
              propsData.onCancel.apply(propsData, arguments);
            }
          }
        }), slot ? {
          default: function _default() {
            return slot;
          }
        } : undefined);
        return this.dialogVNode;
      }
    });
    return vueInstance.mount(container);
  }
  if (!config.defaultProgrammaticPromise) {
    return createDialog();
  } else {
    return new Promise(function (resolve) {
      var dialog = createDialog(function (event) {
        return resolve({
          result: event || true,
          dialog: dialog
        });
      }, function () {
        return resolve({
          result: false,
          dialog: dialog
        });
      });
    });
  }
}
var DialogProgrammatic = {
  alert: function alert(params) {
    if (typeof params === 'string') {
      params = {
        message: params
      };
    }
    var defaultParam = {
      canCancel: false
    };
    var propsData = merge(defaultParam, params);
    return open(propsData);
  },
  confirm: function confirm(params) {
    var defaultParam = {};
    var propsData = merge(defaultParam, params);
    return open(propsData);
  },
  prompt: function prompt(params) {
    var defaultParam = {
      hasInput: true
    };
    var propsData = merge(defaultParam, params);
    return open(propsData);
  }
};
var Plugin$_ = {
  install: function install(Vue) {
    registerComponent(Vue, script$D);
    registerComponentProgrammatic(Vue, 'dialog', DialogProgrammatic);
  }
};
use(Plugin$_);
var Plugin$$ = Plugin$_;

var Plugin$Y = {
  install: function install(Vue) {
    registerComponent(Vue, script$W);
    registerComponent(Vue, script$V);
  }
};
use(Plugin$Y);
var Plugin$Z = Plugin$Y;

var Plugin$W = {
  install: function install(Vue) {
    registerComponent(Vue, script$T);
  }
};
use(Plugin$W);
var Plugin$X = Plugin$W;

var Plugin$U = {
  install: function install(Vue) {
    registerComponent(Vue, script$17);
  }
};
use(Plugin$U);
var Plugin$V = Plugin$U;

var Plugin$S = {
  install: function install(Vue) {
    registerComponent(Vue, script$$);
  }
};
use(Plugin$S);
var Plugin$T = Plugin$S;

var Plugin$Q = {
  install: function install(Vue) {
    registerComponent(Vue, script$16);
  }
};
use(Plugin$Q);
var Plugin$R = Plugin$Q;

// Polyfills for SSR

var isSSR = typeof window === 'undefined';
var HTMLElement = isSSR ? Object : window.HTMLElement;
var File = isSSR ? Object : window.File;

var script$C = {
    name: 'BLoading',
    props: {
        modelValue: Boolean,
        programmatic: Boolean,
        container: [Object, Function, HTMLElement],
        isFullPage: {
            type: Boolean,
            default: true
        },
        animation: {
            type: String,
            default: 'fade'
        },
        canCancel: {
            type: Boolean,
            default: false
        },
        onCancel: {
            type: Function,
            default: () => {}
        }
    },
    emits: ['close', 'update:is-full-page', 'update:modelValue'],
    data() {
        return {
            isActive: this.modelValue || false,
            displayInFullPage: this.isFullPage
        }
    },
    watch: {
        modelValue(value) {
            this.isActive = value;
        },
        isFullPage(value) {
            this.displayInFullPage = value;
        }
    },
    methods: {
        /**
        * Close the Modal if canCancel.
        */
        cancel() {
            if (!this.canCancel || !this.isActive) return

            this.close();
        },
        /**
        * Emit events, and destroy modal if it's programmatic.
        */
        close() {
            this.onCancel.apply(null, arguments);
            this.$emit('close');
            this.$emit('update:modelValue', false);

            // Timeout for the animation complete before destroying
            if (this.programmatic) {
                this.isActive = false;
                // TODO: should the following happen outside this component;
                // i.e., in index.js?
                setTimeout(() => {
                    removeElement(this.$el);
                }, 150);
            }
        },
        /**
        * Keypress event that is bound to the document.
        */
        keyPress({ key }) {
            if (key === 'Escape' || key === 'Esc') this.cancel();
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keyup', this.keyPress);
        }
    },
    mounted() {
        // Insert the Loading component in body tag
        // only if it's programmatic
        // (moved from beforeMount because $el is not bound during beforeMount)
        // TODO: should this happen outside this component; i.e., in index.js?
        if (this.programmatic) {
            if (!this.container) {
                document.body.appendChild(this.$el);
            } else {
                this.displayInFullPage = false;
                this.$emit('update:is-full-page', false);
                this.container.appendChild(this.$el);
            }
            this.isActive = true;
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keyup', this.keyPress);
        }
    }
};

const _hoisted_1$r = /*#__PURE__*/createElementVNode("div", { class: "loading-icon" }, null, -1 /* HOISTED */);

function render$w(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, { name: $props.animation }, {
    default: withCtx(() => [
      ($data.isActive)
        ? withDirectives((openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(["loading-overlay is-active", { 'is-full-page': $data.displayInFullPage }])
          }, [
            createElementVNode("div", {
              class: "loading-background",
              onClick: _cache[0] || (_cache[0] = (...args) => ($options.cancel && $options.cancel(...args)))
            }),
            renderSlot(_ctx.$slots, "default", {}, () => [
              _hoisted_1$r
            ])
          ], 2 /* CLASS */)), [
            [vShow, $data.isActive]
          ])
        : createCommentVNode("v-if", true)
    ]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["name"]))
}

script$C.render = render$w;
script$C.__file = "src/components/loading/Loading.vue";

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$6(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var LoadingProgrammatic = {
  open: function open(params) {
    var defaultParam = {
      programmatic: true
    };
    var propsData = merge(defaultParam, params);
    var container = document.createElement('div');
    var vueInstance = createApp({
      data: function data() {
        return {
          loadingVNode: null
        };
      },
      methods: {
        close: function close() {
          // TODO: too much dependence on Vue's internal structure?
          var loading = getComponentFromVNode(this.loadingVNode);
          if (loading) {
            loading.close();
          }
        }
      },
      render: function render() {
        this.loadingVNode = h(script$C, _objectSpread$6(_objectSpread$6({}, propsData), {}, {
          onClose: function onClose() {
            if (propsData.onClose) {
              propsData.onClose.apply(propsData, arguments);
            }
            // timeout for the animation complete before destroying
            setTimeout(function () {
              vueInstance.unmount();
            }, 150);
          }
        }));
        return this.loadingVNode;
      }
    });
    return vueInstance.mount(container);
  }
};
var Plugin$O = {
  install: function install(Vue) {
    registerComponent(Vue, script$C);
    registerComponentProgrammatic(Vue, 'loading', LoadingProgrammatic);
  }
};
use(Plugin$O);
var Plugin$P = Plugin$O;

var MenuItemContainerMixin = {
  provide: function provide() {
    return {
      BMenuItemContainer: this
    };
  },
  data: function data() {
    return {
      menuItems: []
    };
  },
  methods: {
    appendMenuItem: function appendMenuItem(item) {
      this.menuItems.push(item);
    },
    removeMenuItem: function removeMenuItem(item) {
      var index = this.menuItems.indexOf(item);
      if (index !== -1) {
        this.menuItems.splice(index, 1);
      }
    }
  }
};

var script$B = {
    name: 'BMenu',
    mixins: [MenuItemContainerMixin],
    props: {
        accordion: {
            type: Boolean,
            default: true
        },
        activable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            _isMenu: true // Used by MenuItem
        }
    }
};

const _hoisted_1$q = { class: "menu" };

function render$v(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$q, [
    renderSlot(_ctx.$slots, "default")
  ]))
}

script$B.render = render$v;
script$B.__file = "src/components/menu/Menu.vue";

const BMenuList = (props, context) => {
    let vlabel = null;
    const slots = context.slots;
    if (props.label || slots.label) {
        vlabel = h(
            'p',
            { class: 'menu-label' },
            props.label
                ? props.icon
                    ? [
                        h(resolveComponent('b-icon'), {
                            icon: props.icon,
                            pack: props.iconPack,
                            size: props.size
                        }),
                        h('span', {}, props.label)
                    ]
                    : props.label
                : slots.label()
        );
    }
    const vnode = h(
        'ul',
        {
            class: 'menu-list',
            role: props.ariaRole === 'menu' ? props.ariaRole : null
        },
        slots.default()
    );
    return vlabel ? [vlabel, vnode] : vnode
};

BMenuList.props = {
    label: String,
    icon: String,
    iconPack: String,
    ariaRole: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'is-small'
    }
};

var script$A = BMenuList;

script$A.__file = "src/components/menu/MenuList.vue";

var script$z = {
    name: 'BMenuItem',
    components: {
        [script$17.name]: script$17
    },
    mixins: [MenuItemContainerMixin],
    inject: {
        parent: {
            from: 'BMenuItemContainer',
            default: null
        }
    },
    inheritAttrs: false,
    // deprecated, to replace with default 'value' in the next breaking change
    model: {
        prop: 'active',
        event: 'update:active'
    },
    props: {
        label: String,
        active: Boolean,
        expanded: Boolean,
        disabled: Boolean,
        iconPack: String,
        icon: String,
        animation: {
            type: String,
            default: 'slide'
        },
        tag: {
            type: String,
            default: 'a',
            validator: (value) => {
                return config.defaultLinkTags.indexOf(value) >= 0
            }
        },
        ariaRole: {
            type: String,
            default: ''
        },
        size: {
            type: String,
            default: 'is-small'
        }
    },
    emits: ['update:active', 'update:expanded'],
    data() {
        return {
            newActive: this.active,
            newExpanded: this.expanded
        }
    },
    computed: {
        ariaRoleMenu() {
            return this.ariaRole === 'menuitem' ? this.ariaRole : null
        }
    },
    watch: {
        active(value) {
            this.newActive = value;
        },
        expanded(value) {
            this.newExpanded = value;
        }
    },
    methods: {
        onClick(event) {
            if (this.disabled) return
            const menu = this.getMenu();
            this.reset(this.parent, menu);
            this.newExpanded = this.$props.expanded || !this.newExpanded;
            this.$emit('update:expanded', this.newExpanded);
            if (menu && menu.activable) {
                this.newActive = true;
                this.$emit('update:active', this.newActive);
            }
        },
        reset(parent, menu) {
            if (parent == null) {
                return
            }
            parent.menuItems.forEach((item) => {
                if (item !== this) {
                    this.reset(item, menu);
                    if (!parent.$data._isMenu || (parent.$data._isMenu && parent.accordion)) {
                        item.newExpanded = false;
                        item.$emit('update:expanded', item.newActive);
                    }
                    if (menu && menu.activable) {
                        item.newActive = false;
                        item.$emit('update:active', item.newActive);
                    }
                }
            });
        },
        getMenu() {
            let parent = this.$parent;
            while (parent && !parent.$data._isMenu) {
                parent = parent.$parent;
            }
            return parent
        }
    },
    mounted() {
        if (this.parent) {
            this.parent.appendMenuItem(this);
        }
    },
    beforeUnmount() {
        if (this.parent) {
            this.parent.removeMenuItem(this);
        }
    }
};

const _hoisted_1$p = ["role"];
const _hoisted_2$m = { key: 1 };

function render$u(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("li", { role: $options.ariaRoleMenu }, [
    (openBlock(), createBlock(resolveDynamicComponent($props.tag), mergeProps(_ctx.$attrs, {
      class: {
                'is-active': $data.newActive,
                'is-expanded': $data.newExpanded,
                'is-disabled': $props.disabled,
                'icon-text': $props.icon,
            },
      onClick: _cache[0] || (_cache[0] = $event => ($options.onClick($event)))
    }), {
      default: withCtx(() => [
        ($props.icon)
          ? (openBlock(), createBlock(_component_b_icon, {
              key: 0,
              icon: $props.icon,
              pack: $props.iconPack,
              size: $props.size
            }, null, 8 /* PROPS */, ["icon", "pack", "size"]))
          : createCommentVNode("v-if", true),
        ($props.label)
          ? (openBlock(), createElementBlock("span", _hoisted_2$m, toDisplayString($props.label), 1 /* TEXT */))
          : renderSlot(_ctx.$slots, "label", {
              key: 2,
              expanded: $data.newExpanded,
              active: $data.newActive
            })
      ]),
      _: 3 /* FORWARDED */
    }, 16 /* FULL_PROPS */, ["class"])),
    createCommentVNode(" sub menu items "),
    (_ctx.$slots.default)
      ? (openBlock(), createBlock(Transition, {
          key: 0,
          name: $props.animation,
          persisted: ""
        }, {
          default: withCtx(() => [
            withDirectives(createElementVNode("ul", null, [
              renderSlot(_ctx.$slots, "default")
            ], 512 /* NEED_PATCH */), [
              [vShow, $data.newExpanded]
            ])
          ]),
          _: 3 /* FORWARDED */
        }, 8 /* PROPS */, ["name"]))
      : createCommentVNode("v-if", true)
  ], 8 /* PROPS */, _hoisted_1$p))
}

script$z.render = render$u;
script$z.__file = "src/components/menu/MenuItem.vue";

var Plugin$M = {
  install: function install(Vue) {
    registerComponent(Vue, script$B);
    registerComponent(Vue, script$A);
    registerComponent(Vue, script$z);
  }
};
use(Plugin$M);
var Plugin$N = Plugin$M;

var MessageMixin = {
  components: _defineProperty({}, script$17.name, script$17),
  props: {
    modelValue: {
      type: Boolean,
      default: true
    },
    title: String,
    closable: {
      type: Boolean,
      default: true
    },
    message: String,
    type: String,
    hasIcon: Boolean,
    size: String,
    icon: String,
    iconPack: String,
    iconSize: String,
    autoClose: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 2000
    },
    progressBar: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click', 'close', 'update:modelValue'],
  data: function data() {
    return {
      isActive: this.modelValue,
      remainingTime: this.duration / 1000,
      // in seconds
      newIconSize: this.iconSize || this.size || 'is-large'
    };
  },
  watch: {
    modelValue: function modelValue(value) {
      this.isActive = value;
    },
    isActive: function isActive(value) {
      if (value) {
        this.setAutoClose();
        this.setDurationProgress();
      } else {
        if (this.timer) {
          clearTimeout(this.timer);
        }
      }
    }
  },
  computed: {
    /**
     * Icon name (MDI) based on type.
     */
    computedIcon: function computedIcon() {
      if (this.icon) {
        return this.icon;
      }
      switch (this.type) {
        case 'is-info':
          return 'information';
        case 'is-success':
          return 'check-circle';
        case 'is-warning':
          return 'alert';
        case 'is-danger':
          return 'alert-circle';
        default:
          return null;
      }
    }
  },
  methods: {
    /**
     * Close the Message and emit events.
     */
    close: function close() {
      this.isActive = false;
      this.resetDurationProgress();
      this.$emit('close');
      this.$emit('update:modelValue', false);
    },
    click: function click() {
      this.$emit('click');
    },
    /**
     * Set timer to auto close message
     */
    setAutoClose: function setAutoClose() {
      var _this = this;
      if (this.autoClose) {
        this.timer = setTimeout(function () {
          if (_this.isActive) {
            _this.close();
          }
        }, this.duration);
      }
    },
    setDurationProgress: function setDurationProgress() {
      var _this2 = this;
      if (this.progressBar) {
        /**
         * Runs every one second to set the duration passed before
         * the alert will auto close to show it in the progress bar (Remaining Time)
         */
        this.$buefy.globalNoticeInterval = setInterval(function () {
          if (_this2.remainingTime !== 0) {
            _this2.remainingTime -= 1;
          } else {
            _this2.resetDurationProgress();
          }
        }, 1000);
      }
    },
    resetDurationProgress: function resetDurationProgress() {
      var _this3 = this;
      /**
       * Wait until the component get closed and then reset
       **/
      setTimeout(function () {
        _this3.remainingTime = _this3.duration / 1000;
        clearInterval(_this3.$buefy.globalNoticeInterval);
      }, 100);
    }
  },
  mounted: function mounted() {
    this.setAutoClose();
  }
};

var script$y = {
    name: 'BMessage',
    mixins: [MessageMixin],
    props: {
        ariaCloseLabel: String
    }
};

const _hoisted_1$o = {
  key: 0,
  class: "message-header"
};
const _hoisted_2$l = { key: 0 };
const _hoisted_3$c = { key: 1 };
const _hoisted_4$8 = ["aria-label"];
const _hoisted_5$6 = {
  key: 1,
  class: "message-body"
};
const _hoisted_6$3 = { class: "media" };
const _hoisted_7$3 = {
  key: 0,
  class: "media-left"
};
const _hoisted_8$3 = { class: "media-content" };

function render$t(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");
  const _component_b_progress = resolveComponent("b-progress");

  return (openBlock(), createBlock(Transition, {
    name: "fade",
    persisted: ""
  }, {
    default: withCtx(() => [
      withDirectives(createElementVNode("article", {
        class: normalizeClass(["message", [_ctx.type, _ctx.size]])
      }, [
        (_ctx.$slots.header || _ctx.title)
          ? (openBlock(), createElementBlock("header", _hoisted_1$o, [
              (_ctx.$slots.header)
                ? (openBlock(), createElementBlock("div", _hoisted_2$l, [
                    renderSlot(_ctx.$slots, "header")
                  ]))
                : (_ctx.title)
                  ? (openBlock(), createElementBlock("p", _hoisted_3$c, toDisplayString(_ctx.title), 1 /* TEXT */))
                  : createCommentVNode("v-if", true),
              (_ctx.closable)
                ? (openBlock(), createElementBlock("button", {
                    key: 2,
                    type: "button",
                    class: "delete",
                    onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.close && _ctx.close(...args))),
                    "aria-label": $props.ariaCloseLabel
                  }, null, 8 /* PROPS */, _hoisted_4$8))
                : createCommentVNode("v-if", true)
            ]))
          : createCommentVNode("v-if", true),
        (_ctx.$slots.default)
          ? (openBlock(), createElementBlock("section", _hoisted_5$6, [
              createElementVNode("div", _hoisted_6$3, [
                (_ctx.computedIcon && _ctx.hasIcon)
                  ? (openBlock(), createElementBlock("div", _hoisted_7$3, [
                      createVNode(_component_b_icon, {
                        icon: _ctx.computedIcon,
                        pack: _ctx.iconPack,
                        class: normalizeClass(_ctx.type),
                        both: "",
                        size: _ctx.newIconSize
                      }, null, 8 /* PROPS */, ["icon", "pack", "class", "size"])
                    ]))
                  : createCommentVNode("v-if", true),
                createElementVNode("div", _hoisted_8$3, [
                  renderSlot(_ctx.$slots, "default")
                ])
              ])
            ]))
          : createCommentVNode("v-if", true),
        (_ctx.autoClose && _ctx.progressBar)
          ? (openBlock(), createBlock(_component_b_progress, {
              key: 2,
              class: "auto-close-progress",
              value: _ctx.remainingTime - 1,
              max: _ctx.duration / 1000 - 1,
              type: _ctx.type,
              rounded: false
            }, null, 8 /* PROPS */, ["value", "max", "type"]))
          : createCommentVNode("v-if", true)
      ], 2 /* CLASS */), [
        [vShow, _ctx.isActive]
      ])
    ]),
    _: 3 /* FORWARDED */
  }))
}

script$y.render = render$t;
script$y.__file = "src/components/message/Message.vue";

var Plugin$K = {
  install: function install(Vue) {
    registerComponent(Vue, script$y);
  }
};
use(Plugin$K);
var Plugin$L = Plugin$K;

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$5(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var ModalProgrammatic = {
  // component specified to the `component` option cannot resolve components
  // registered to the caller app, because `open` creates a brand-new app
  // by the `createApp` API.
  // so the component specified to the `component` option has to explicitly
  // reference components that it depends on.
  // see /docs/pages/components/modal/examples/ExProgrammatic for an example.
  open: function open(params) {
    if (typeof params === 'string') {
      params = {
        content: params
      };
    }
    var defaultParam = {
      programmatic: true
    };
    if (params.parent) {
      delete params.parent;
    }
    var slot;
    if (Array.isArray(params.content)) {
      slot = params.content;
      delete params.content;
    }
    var propsData = merge(defaultParam, params);
    var container = document.createElement('div');
    // I could not figure out how to extend an existing app to create a new
    // Vue instance on Vue 3.
    var vueInstance = createApp({
      data: function data() {
        return {
          modalVNode: null
        };
      },
      methods: {
        close: function close() {
          var modal = getComponentFromVNode(this.modalVNode);
          if (modal) {
            modal.close();
          }
        }
      },
      render: function render() {
        this.modalVNode = h(script$E, _objectSpread$5(_objectSpread$5({}, propsData), {}, {
          onClose: function onClose() {
            vueInstance.unmount();
          },
          // intentionally overrides propsData.onCancel
          // to prevent propsData.onCancel from receiving a "cancel" event
          onCancel: function onCancel() {},
          cancelCallback: function cancelCallback() {
            if (propsData.onCancel != null) {
              propsData.onCancel.apply(propsData, arguments);
            }
          }
        }), slot ? {
          default: function _default() {
            return slot;
          }
        } : undefined);
        return this.modalVNode;
      }
    });
    return vueInstance.mount(container);
  }
};
var Plugin$I = {
  install: function install(Vue) {
    registerComponent(Vue, script$E);
    registerComponentProgrammatic(Vue, 'modal', ModalProgrammatic);
  }
};
use(Plugin$I);
var Plugin$J = Plugin$I;

var script$x = {
    name: 'BProgress',
    mixins: [ProviderParentMixin('progress')],
    props: {
        type: {
            type: [String, Object],
            default: 'is-darkgrey'
        },
        size: String,
        rounded: {
            type: Boolean,
            default: true
        },
        value: {
            type: Number,
            default: undefined
        },
        max: {
            type: Number,
            default: 100
        },
        showValue: {
            type: Boolean,
            default: false
        },
        format: {
            type: String,
            default: 'raw',
            validator: (value) => {
                return [
                    'raw',
                    'percent'
                ].indexOf(value) >= 0
            }
        },
        precision: {
            type: Number,
            default: 2
        },
        keepTrailingZeroes: {
            type: Boolean,
            default: false
        },
        locale: {
            type: [String, Array],
            default: () => {
                return config.defaultLocale
            }
        }
    },
    computed: {
        isIndeterminate() {
            return this.value === undefined || this.value === null
        },
        newType() {
            return [
                this.size,
                this.type,
                {
                    'is-more-than-half': this.value && this.value > this.max / 2
                }
            ]
        },
        newValue() {
            return this.calculateValue(this.value)
        },
        isNative() {
            return this.$slots.bar === undefined
        },
        wrapperClasses() {
            return {
                'is-not-native': !this.isNative,
                [this.size]: typeof this.size === 'string' && !this.isNative
            }
        }
    },
    watch: {
        /**
         * When value is changed back to undefined, value of native progress get reset to 0.
         * Need to add and remove the value attribute to have the indeterminate or not.
         */
        isIndeterminate(indeterminate) {
            this.$nextTick(() => {
                if (this.$refs.progress) {
                    if (indeterminate) {
                        this.$refs.progress.removeAttribute('value');
                    } else {
                        this.$refs.progress.setAttribute('value', this.value);
                    }
                }
            });
        }
    },
    methods: {
        calculateValue(value) {
            if (value === undefined || value === null || isNaN(value)) {
                return undefined
            }

            const minimumFractionDigits = this.keepTrailingZeroes ? this.precision : 0;
            const maximumFractionDigits = this.precision;
            if (this.format === 'percent') {
                return new Intl.NumberFormat(
                    this.locale,
                    {
                        style: 'percent',
                        minimumFractionDigits: minimumFractionDigits,
                        maximumFractionDigits: maximumFractionDigits
                    }
                ).format(value / this.max)
            }

            return new Intl.NumberFormat(
                this.locale,
                {
                    minimumFractionDigits: minimumFractionDigits,
                    maximumFractionDigits: maximumFractionDigits
                }
            ).format(value)
        }
    }
};

const _hoisted_1$n = ["max", "value"];
const _hoisted_2$k = {
  key: 2,
  class: "progress-value"
};

function render$s(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["progress-wrapper", [$options.wrapperClasses, { 'is-squared': !$props.rounded }]])
  }, [
    ($options.isNative)
      ? (openBlock(), createElementBlock("progress", {
          key: 0,
          ref: "progress",
          class: normalizeClass(["progress", [$options.newType, { 'is-squared': !$props.rounded }]]),
          max: $props.max,
          value: $props.value
        }, toDisplayString($options.newValue), 11 /* TEXT, CLASS, PROPS */, _hoisted_1$n))
      : renderSlot(_ctx.$slots, "bar", { key: 1 }),
    ($options.isNative && $props.showValue)
      ? (openBlock(), createElementBlock("p", _hoisted_2$k, [
          renderSlot(_ctx.$slots, "default", {}, () => [
            createTextVNode(toDisplayString($options.newValue), 1 /* TEXT */)
          ])
        ]))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$x.render = render$s;
script$x.__file = "src/components/progress/Progress.vue";

var script$w = {
    name: 'BNotification',
    components: {
        // directly registers Progress
        // in case Notification is programmatically opened
        [script$x.name]: script$x
    },
    mixins: [MessageMixin],
    props: {
        position: String,
        ariaCloseLabel: String,
        animation: {
            type: String,
            default: 'fade'
        }
    }
};

const _hoisted_1$m = ["aria-label"];
const _hoisted_2$j = {
  key: 1,
  class: "media"
};
const _hoisted_3$b = {
  key: 0,
  class: "media-left"
};
const _hoisted_4$7 = { class: "media-content" };
const _hoisted_5$5 = ["innerHTML"];

function render$r(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");
  const _component_b_progress = resolveComponent("b-progress");

  return (openBlock(), createBlock(Transition, {
    name: $props.animation,
    persisted: ""
  }, {
    default: withCtx(() => [
      withDirectives(createElementVNode("article", {
        class: normalizeClass(["notification", [_ctx.type, $props.position]]),
        onClick: _cache[1] || (_cache[1] = (...args) => (_ctx.click && _ctx.click(...args)))
      }, [
        (_ctx.closable)
          ? (openBlock(), createElementBlock("button", {
              key: 0,
              class: "delete",
              type: "button",
              onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.close && _ctx.close(...args))),
              "aria-label": $props.ariaCloseLabel
            }, null, 8 /* PROPS */, _hoisted_1$m))
          : createCommentVNode("v-if", true),
        (_ctx.$slots.default || _ctx.message)
          ? (openBlock(), createElementBlock("div", _hoisted_2$j, [
              (_ctx.computedIcon && _ctx.hasIcon)
                ? (openBlock(), createElementBlock("div", _hoisted_3$b, [
                    createVNode(_component_b_icon, {
                      icon: _ctx.computedIcon,
                      pack: _ctx.iconPack,
                      size: _ctx.newIconSize,
                      both: "",
                      "aria-hidden": ""
                    }, null, 8 /* PROPS */, ["icon", "pack", "size"])
                  ]))
                : createCommentVNode("v-if", true),
              createElementVNode("div", _hoisted_4$7, [
                (_ctx.$slots.default)
                  ? renderSlot(_ctx.$slots, "default", { key: 0 })
                  : (openBlock(), createElementBlock("p", {
                      key: 1,
                      class: "text",
                      innerHTML: _ctx.message
                    }, null, 8 /* PROPS */, _hoisted_5$5))
              ])
            ]))
          : createCommentVNode("v-if", true),
        (_ctx.autoClose && _ctx.progressBar)
          ? (openBlock(), createBlock(_component_b_progress, {
              key: 2,
              class: "auto-close-progress",
              value: _ctx.remainingTime - 1,
              max: _ctx.duration / 1000 - 1,
              type: _ctx.type,
              rounded: false
            }, null, 8 /* PROPS */, ["value", "max", "type"]))
          : createCommentVNode("v-if", true)
      ], 2 /* CLASS */), [
        [vShow, _ctx.isActive]
      ])
    ]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["name"]))
}

script$w.render = render$r;
script$w.__file = "src/components/notification/Notification.vue";

var NoticeMixin = {
  props: {
    type: {
      type: String,
      default: 'is-dark'
    },
    message: [String, Array],
    duration: Number,
    queue: {
      type: Boolean,
      default: undefined
    },
    indefinite: {
      type: Boolean,
      default: false
    },
    pauseOnHover: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      default: 'is-top',
      validator: function validator(value) {
        return ['is-top-right', 'is-top', 'is-top-left', 'is-bottom-right', 'is-bottom', 'is-bottom-left'].indexOf(value) > -1;
      }
    },
    container: String
  },
  emits: ['click', 'close'],
  data: function data() {
    return {
      isActive: false,
      isPaused: false,
      parentTop: null,
      parentBottom: null,
      newContainer: this.container || config.defaultContainerElement
    };
  },
  computed: {
    correctParent: function correctParent() {
      switch (this.position) {
        case 'is-top-right':
        case 'is-top':
        case 'is-top-left':
          return this.parentTop;
        case 'is-bottom-right':
        case 'is-bottom':
        case 'is-bottom-left':
          return this.parentBottom;
      }
    },
    transition: function transition() {
      switch (this.position) {
        case 'is-top-right':
        case 'is-top':
        case 'is-top-left':
          return {
            enter: 'fadeInDown',
            leave: 'fadeOut'
          };
        case 'is-bottom-right':
        case 'is-bottom':
        case 'is-bottom-left':
          return {
            enter: 'fadeInUp',
            leave: 'fadeOut'
          };
      }
    }
  },
  methods: {
    pause: function pause() {
      if (this.pauseOnHover && !this.indefinite) {
        this.isPaused = true;
        clearInterval(this.$buefy.globalNoticeInterval);
      }
    },
    removePause: function removePause() {
      if (this.pauseOnHover && !this.indefinite) {
        this.isPaused = false;
        this.close();
      }
    },
    shouldQueue: function shouldQueue() {
      var queue = this.queue !== undefined ? this.queue : config.defaultNoticeQueue;
      if (!queue) return false;
      return this.parentTop.childElementCount > 0 || this.parentBottom.childElementCount > 0;
    },
    click: function click() {
      this.$emit('click');
    },
    close: function close() {
      var _this = this;
      if (!this.isPaused) {
        clearTimeout(this.timer);
        this.isActive = false;
        this.$emit('close');

        // Timeout for the animation complete before destroying
        setTimeout(function () {
          removeElement(_this.$el);
        }, 150);
      }
    },
    timeoutCallback: function timeoutCallback() {
      return this.close();
    },
    showNotice: function showNotice() {
      var _this2 = this;
      if (this.shouldQueue()) this.correctParent.innerHTML = '';
      this.correctParent.insertAdjacentElement('afterbegin', this.$el);
      this.isActive = true;
      if (!this.indefinite) {
        this.timer = setTimeout(function () {
          return _this2.timeoutCallback();
        }, this.newDuration);
      }
    },
    setupContainer: function setupContainer() {
      this.parentTop = document.querySelector((this.newContainer ? this.newContainer : 'body') + '>.notices.is-top');
      this.parentBottom = document.querySelector((this.newContainer ? this.newContainer : 'body') + '>.notices.is-bottom');
      if (this.parentTop && this.parentBottom) return;
      if (!this.parentTop) {
        this.parentTop = document.createElement('div');
        this.parentTop.className = 'notices is-top';
      }
      if (!this.parentBottom) {
        this.parentBottom = document.createElement('div');
        this.parentBottom.className = 'notices is-bottom';
      }
      var container = document.querySelector(this.newContainer) || document.body;
      container.appendChild(this.parentTop);
      container.appendChild(this.parentBottom);
      if (this.newContainer) {
        this.parentTop.classList.add('has-custom-container');
        this.parentBottom.classList.add('has-custom-container');
      }
    }
  },
  beforeMount: function beforeMount() {
    this.setupContainer();
  },
  mounted: function mounted() {
    this.showNotice();
  }
};

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$4(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// drops props not used by `NoticeMixin` itself
// - type
// - message
// - duration
var _NoticeMixin$props = NoticeMixin.props,
  queue = _NoticeMixin$props.queue,
  indefinite = _NoticeMixin$props.indefinite,
  pauseOnHover = _NoticeMixin$props.pauseOnHover,
  position = _NoticeMixin$props.position,
  container = _NoticeMixin$props.container;
var NoticeMixinSubset = _objectSpread$4(_objectSpread$4({}, NoticeMixin), {}, {
  props: {
    queue: queue,
    indefinite: indefinite,
    pauseOnHover: pauseOnHover,
    position: position,
    container: container
  }
});

var script$v = {
    name: 'BNotificationNotice',
    components: {
        [script$w.name]: script$w
    },
    mixins: [NoticeMixinSubset],
    props: {
        duration: Number
    },
    emits: ['close'],
    data() {
        return {
            newDuration: this.duration || config.defaultNotificationDuration
        }
    },
    methods: {
        close() {
            if (!this.isPaused) {
                clearTimeout(this.timer);
                this.$refs.notification.isActive = false;
                this.$emit('close');

                // Timeout for the animation complete before destroying
                setTimeout(() => {
                    removeElement(this.$el);
                }, 150);
            }
        }
    }
};

function render$q(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_notification = resolveComponent("b-notification");

  return (_ctx.$slots.default != null)
    ? (openBlock(), createBlock(_component_b_notification, mergeProps({
        key: 0,
        ref: "notification",
        position: _ctx.position,
        "model-value": _ctx.isActive
      }, _ctx.$attrs, {
        duration: $props.duration,
        onClick: _ctx.click,
        onClose: $options.close,
        onMouseenter: _ctx.pause,
        onMouseleave: _ctx.removePause
      }), {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3 /* FORWARDED */
      }, 16 /* FULL_PROPS */, ["position", "model-value", "duration", "onClick", "onClose", "onMouseenter", "onMouseleave"]))
    : (openBlock(), createBlock(_component_b_notification, mergeProps({
        key: 1,
        ref: "notification",
        position: _ctx.position,
        "model-value": _ctx.isActive
      }, _ctx.$attrs, {
        duration: $props.duration,
        onClick: _ctx.click,
        onClose: $options.close,
        onMouseenter: _ctx.pause,
        onMouseleave: _ctx.removePause
      }), null, 16 /* FULL_PROPS */, ["position", "model-value", "duration", "onClick", "onClose", "onMouseenter", "onMouseleave"]))
}

script$v.render = render$q;
script$v.__file = "src/components/notification/NotificationNotice.vue";

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$3(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var NotificationProgrammatic = {
  open: function open(params) {
    if (typeof params === 'string') {
      params = {
        message: params
      };
    }
    var defaultParam = {
      position: config.defaultNotificationPosition || 'is-top-right'
    };
    if (params.parent) {
      delete params.parent;
    }
    var _onClose;
    if (typeof params.onClose === 'function') {
      _onClose = params.onClose;
      delete params.onClose;
    }
    var slot;
    if (Array.isArray(params.message)) {
      slot = params.message;
      delete params.message;
    }
    var propsData = merge(defaultParam, params);
    var container = document.createElement('div');
    var vueInstance = createApp({
      data: function data() {
        return {
          noticeVNode: null
        };
      },
      methods: {
        close: function close() {
          var notice = getComponentFromVNode(this.noticeVNode);
          if (notice) {
            notice.close();
          }
        }
      },
      render: function render() {
        this.noticeVNode = h(script$v, _objectSpread$3(_objectSpread$3({}, propsData), {}, {
          onClose: function onClose() {
            if (_onClose != null) {
              _onClose();
            }
            // waits for a while in favor of animation
            setTimeout(function () {
              vueInstance.unmount();
            }, 150);
          }
        }), slot != null ? {
          default: function _default() {
            return slot;
          }
        } : undefined);
        return this.noticeVNode;
      }
    });
    // workaround for an error that
    // $buefy.globalNoticeInterval is not defined
    vueInstance.use({
      install: function install(Vue) {
        Vue.config.globalProperties.$buefy = {
          globalNoticeInterval: null
        };
      }
    });
    return vueInstance.mount(container);
  }
};
var Plugin$G = {
  install: function install(Vue) {
    registerComponent(Vue, script$w);
    registerComponentProgrammatic(Vue, 'notification', NotificationProgrammatic);
  }
};
use(Plugin$G);
var Plugin$H = Plugin$G;

var script$u = {
    name: 'NavbarBurger',
    props: {
        isOpened: {
            type: Boolean,
            default: false
        }
    }
};

const _hoisted_1$l = ["aria-expanded"];
const _hoisted_2$i = /*#__PURE__*/createElementVNode("span", { "aria-hidden": "true" }, null, -1 /* HOISTED */);
const _hoisted_3$a = /*#__PURE__*/createElementVNode("span", { "aria-hidden": "true" }, null, -1 /* HOISTED */);
const _hoisted_4$6 = /*#__PURE__*/createElementVNode("span", { "aria-hidden": "true" }, null, -1 /* HOISTED */);
const _hoisted_5$4 = [
  _hoisted_2$i,
  _hoisted_3$a,
  _hoisted_4$6
];

function render$p(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("a", mergeProps({
    role: "button",
    class: ["navbar-burger burger", { 'is-active': $props.isOpened }],
    "aria-label": "menu",
    "aria-expanded": $props.isOpened
  }, _ctx.$attrs, { tabindex: "0" }), _hoisted_5$4, 16 /* FULL_PROPS */, _hoisted_1$l))
}

script$u.render = render$p;
script$u.__file = "src/components/navbar/NavbarBurger.vue";

var isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.msMaxTouchPoints > 0);
var events = isTouch ? ['touchstart', 'click'] : ['click'];
var instances = [];
function processArgs(bindingValue) {
  var isFunction = typeof bindingValue === 'function';
  if (!isFunction && _typeof(bindingValue) !== 'object') {
    throw new Error("v-click-outside: Binding value should be a function or an object, ".concat(_typeof(bindingValue), " given"));
  }
  return {
    handler: isFunction ? bindingValue : bindingValue.handler,
    middleware: bindingValue.middleware || function (isClickOutside) {
      return isClickOutside;
    },
    events: bindingValue.events || events
  };
}
function onEvent(_ref) {
  var el = _ref.el,
    event = _ref.event,
    handler = _ref.handler,
    middleware = _ref.middleware;
  var isClickOutside = event.target !== el && !el.contains(event.target);
  if (!isClickOutside || !middleware(event, el)) {
    return;
  }
  handler(event, el);
}
function toggleEventListeners() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    eventHandlers = _ref2.eventHandlers;
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'add';
  eventHandlers.forEach(function (_ref3) {
    var event = _ref3.event,
      handler = _ref3.handler;
    document["".concat(action, "EventListener")](event, handler);
  });
}
function beforeMount(el, _ref4) {
  var value = _ref4.value;
  var _processArgs = processArgs(value),
    _handler = _processArgs.handler,
    middleware = _processArgs.middleware,
    events = _processArgs.events;
  var instance = {
    el: el,
    eventHandlers: events.map(function (eventName) {
      return {
        event: eventName,
        handler: function handler(event) {
          return onEvent({
            event: event,
            el: el,
            handler: _handler,
            middleware: middleware
          });
        }
      };
    })
  };
  toggleEventListeners(instance, 'add');
  instances.push(instance);
}
function updated(el, _ref5) {
  var value = _ref5.value;
  var _processArgs2 = processArgs(value),
    _handler2 = _processArgs2.handler,
    middleware = _processArgs2.middleware,
    events = _processArgs2.events;
  // `filter` instead of `find` for compat with IE
  var instance = instances.filter(function (instance) {
    return instance.el === el;
  })[0];
  toggleEventListeners(instance, 'remove');
  instance.eventHandlers = events.map(function (eventName) {
    return {
      event: eventName,
      handler: function handler(event) {
        return onEvent({
          event: event,
          el: el,
          handler: _handler2,
          middleware: middleware
        });
      }
    };
  });
  toggleEventListeners(instance, 'add');
}
function unmounted(el) {
  // `filter` instead of `find` for compat with IE
  var instance = instances.filter(function (instance) {
    return instance.el === el;
  })[0];
  toggleEventListeners(instance, 'remove');
}
var directive = {
  beforeMount: beforeMount,
  updated: updated,
  unmounted: unmounted,
  instances: instances
};
var clickOutside = directive;

const FIXED_TOP_CLASS = 'is-fixed-top';
const BODY_FIXED_TOP_CLASS = 'has-navbar-fixed-top';
const BODY_SPACED_FIXED_TOP_CLASS = 'has-spaced-navbar-fixed-top';
const FIXED_BOTTOM_CLASS = 'is-fixed-bottom';
const BODY_FIXED_BOTTOM_CLASS = 'has-navbar-fixed-bottom';
const BODY_SPACED_FIXED_BOTTOM_CLASS = 'has-spaced-navbar-fixed-bottom';
const BODY_CENTERED_CLASS = 'has-navbar-centered';

const isFilled = (str) => !!str;

var script$t = {
    name: 'BNavbar',
    components: {
        NavbarBurger: script$u
    },
    directives: {
        clickOutside
    },
    props: {
        type: [String, Object],
        transparent: {
            type: Boolean,
            default: false
        },
        fixedTop: {
            type: Boolean,
            default: false
        },
        fixedBottom: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: Boolean,
            default: false
        },
        centered: {
            type: Boolean,
            default: false
        },
        wrapperClass: {
            type: [String, Array, Object]
        },
        closeOnClick: {
            type: Boolean,
            default: true
        },
        mobileBurger: {
            type: Boolean,
            default: true
        },
        spaced: Boolean,
        shadow: Boolean
    },
    emits: ['update:modelValue'],
    data() {
        return {
            internalIsActive: this.modelValue,
            _isNavBar: true // Used internally by NavbarItem
        }
    },
    computed: {
        isOpened() {
            return this.internalIsActive
        },
        computedClasses() {
            return [
                this.type,
                {
                    [FIXED_TOP_CLASS]: this.fixedTop,
                    [FIXED_BOTTOM_CLASS]: this.fixedBottom,
                    [BODY_CENTERED_CLASS]: this.centered,
                    'is-spaced': this.spaced,
                    'has-shadow': this.shadow,
                    'is-transparent': this.transparent
                }
            ]
        }
    },
    watch: {
        modelValue: {
            handler(active) {
                this.internalIsActive = active;
            },
            immediate: true
        },
        fixedTop(isSet) {
            // toggle body class only on update to handle multiple navbar
            this.setBodyFixedTopClass(isSet);
        },
        bottomTop(isSet) {
            // toggle body class only on update to handle multiple navbar
            this.setBodyFixedBottomClass(isSet);
        }
    },
    methods: {
        toggleActive() {
            this.internalIsActive = !this.internalIsActive;
            this.emitUpdateParentEvent();
        },
        closeMenu() {
            if (this.closeOnClick && this.internalIsActive) {
                this.internalIsActive = false;
                this.emitUpdateParentEvent();
            }
        },
        emitUpdateParentEvent() {
            this.$emit('update:modelValue', this.internalIsActive);
        },
        setBodyClass(className) {
            if (typeof window !== 'undefined') {
                document.body.classList.add(className);
            }
        },
        removeBodyClass(className) {
            if (typeof window !== 'undefined') {
                document.body.classList.remove(className);
            }
        },
        checkIfFixedPropertiesAreColliding() {
            const areColliding = this.fixedTop && this.fixedBottom;
            if (areColliding) {
                throw new Error('You should choose if the BNavbar is fixed bottom or fixed top, but not both')
            }
        },
        genNavbar() {
            const navBarSlots = [
                this.genNavbarBrandNode(),
                this.genNavbarSlotsNode()
            ];

            if (!isFilled(this.wrapperClass)) {
                return this.genNavbarSlots(navBarSlots)
            }

            // It wraps the slots into a div with the provided wrapperClass prop
            const navWrapper = h(
                'div',
                { class: this.wrapperClass },
                navBarSlots
            );

            return this.genNavbarSlots([navWrapper])
        },
        genNavbarSlots(slots) {
            const vnode = h(
                'nav',
                {
                    class: ['navbar', this.computedClasses],
                    role: 'navigation',
                    'aria-label': 'main navigation'
                },
                slots
            );
            return withDirectives(vnode, [
                [resolveDirective('click-outside'), this.closeMenu]
            ])
        },
        genNavbarBrandNode() {
            return h(
                'div',
                { class: 'navbar-brand' },
                [this.$slots.brand(), this.genBurgerNode()]
            )
        },
        genBurgerNode() {
            if (this.mobileBurger) {
                const defaultBurgerNode = h(
                    resolveComponent('navbar-burger'),
                    {
                        isOpened: this.isOpened,
                        onClick: this.toggleActive,
                        onKeyup: (event) => {
                            if (event.keyCode !== 13) return
                            this.toggleActive();
                        }
                    }
                );

                const hasBurgerSlot = !!this.$slots.burger;
                return hasBurgerSlot
                    ? this.$slots.burger({
                        isOpened: this.isOpened,
                        toggleActive: this.toggleActive
                    })
                    : defaultBurgerNode
            }
        },
        genNavbarSlotsNode() {
            return h(
                'div',
                { class: ['navbar-menu', { 'is-active': this.isOpened }] },
                [
                    this.genMenuPosition('start'),
                    this.genMenuPosition('end')
                ]
            )
        },
        genMenuPosition(positionName) {
            return h(
                'div',
                { class: `navbar-${positionName}` },
                this.$slots[positionName] != null
                    ? this.$slots[positionName]()
                    : []
            )
        },
        setBodyFixedTopClass(isSet) {
            this.checkIfFixedPropertiesAreColliding();
            if (isSet) {
                // TODO Apply only one of the classes once PR is merged in Bulma:
                // https://github.com/jgthms/bulma/pull/2737
                this.setBodyClass(BODY_FIXED_TOP_CLASS);
                this.spaced && this.setBodyClass(BODY_SPACED_FIXED_TOP_CLASS);
            } else {
                this.removeBodyClass(BODY_FIXED_TOP_CLASS);
                this.removeBodyClass(BODY_SPACED_FIXED_TOP_CLASS);
            }
        },
        setBodyFixedBottomClass(isSet) {
            this.checkIfFixedPropertiesAreColliding();
            if (isSet) {
                // TODO Apply only one of the classes once PR is merged in Bulma:
                // https://github.com/jgthms/bulma/pull/2737
                this.setBodyClass(BODY_FIXED_BOTTOM_CLASS);
                this.spaced && this.setBodyClass(BODY_SPACED_FIXED_BOTTOM_CLASS);
            } else {
                this.removeBodyClass(BODY_FIXED_BOTTOM_CLASS);
                this.removeBodyClass(BODY_SPACED_FIXED_BOTTOM_CLASS);
            }
        }
    },
    beforeMount() {
        this.fixedTop && this.setBodyFixedTopClass(true);
        this.fixedBottom && this.setBodyFixedBottomClass(true);
    },
    beforeUnmount() {
        if (this.fixedTop) {
            const className = this.spaced
                ? BODY_SPACED_FIXED_TOP_CLASS
                : BODY_FIXED_TOP_CLASS;
            this.removeBodyClass(className);
        } else if (this.fixedBottom) {
            const className = this.spaced
                ? BODY_SPACED_FIXED_BOTTOM_CLASS
                : BODY_FIXED_BOTTOM_CLASS;
            this.removeBodyClass(className);
        }
    },
    render() {
        return this.genNavbar()
    }
};

script$t.__file = "src/components/navbar/Navbar.vue";

const clickableWhiteList = ['div', 'span', 'input'];

var script$s = {
    name: 'BNavbarItem',
    inheritAttrs: false,
    props: {
        tag: {
            type: String,
            default: 'a'
        },
        active: Boolean
    },
    methods: {
        /**
         * Keypress event that is bound to the document
         */
        keyPress({ key }) {
            if (key === 'Escape' || key === 'Esc') {
                this.closeMenuRecursive(this, ['NavBar']);
            }
        },
        /**
         * Close parent if clicked outside.
         */
        handleClickEvent(event) {
            const isOnWhiteList = clickableWhiteList.some((item) => item === event.target.localName);
            if (!isOnWhiteList) {
                const parent = this.closeMenuRecursive(this, ['NavbarDropdown', 'NavBar']);
                if (parent && parent.$data._isNavbarDropdown) this.closeMenuRecursive(parent, ['NavBar']);
            }
        },
        /**
         * Close parent recursively
         */
        closeMenuRecursive(current, targetComponents) {
            if (!current.$parent) return null
            const foundItem = targetComponents.reduce((acc, item) => {
                if (current.$parent.$data[`_is${item}`]) {
                    current.$parent.closeMenu();
                    return current.$parent
                }
                return acc
            }, null);
            return foundItem || this.closeMenuRecursive(current.$parent, targetComponents)
        }
    },
    mounted() {
        if (typeof window !== 'undefined') {
            this.$el.addEventListener('click', this.handleClickEvent);
            document.addEventListener('keyup', this.keyPress);
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            this.$el.removeEventListener('click', this.handleClickEvent);
            document.removeEventListener('keyup', this.keyPress);
        }
    }
};

function render$o(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(resolveDynamicComponent($props.tag), mergeProps({
    class: ["navbar-item", {
            'is-active': $props.active
        }]
  }, _ctx.$attrs), {
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default")
    ]),
    _: 3 /* FORWARDED */
  }, 16 /* FULL_PROPS */, ["class"]))
}

script$s.render = render$o;
script$s.__file = "src/components/navbar/NavbarItem.vue";

var script$r = {
    name: 'BNavbarDropdown',
    directives: {
        clickOutside
    },
    inheritAttrs: false,
    props: {
        label: String,
        hoverable: Boolean,
        active: Boolean,
        right: Boolean,
        arrowless: Boolean,
        boxed: Boolean,
        closeOnClick: {
            type: Boolean,
            default: true
        },
        collapsible: Boolean,
        tag: {
            type: String,
            default: 'a'
        }
    },
    emits: ['active-change'],
    data() {
        return {
            newActive: this.active,
            isHoverable: this.hoverable,
            _isNavbarDropdown: true // Used internally by NavbarItem
        }
    },
    watch: {
        active(value) {
            this.newActive = value;
        },

        newActive(value) {
            this.$emit('active-change', value);
        }
    },
    methods: {
        toggleMenu() {
            this.newActive = !this.newActive;
        },
        showMenu() {
            this.newActive = true;
        },
        /**
        * See naming convetion of navbaritem
        */
        closeMenu() {
            this.newActive = !this.closeOnClick;
            if (this.hoverable && this.closeOnClick) {
                this.isHoverable = false;
            }
        },
        checkHoverable() {
            if (this.hoverable) {
                this.isHoverable = true;
            }
        }
    }
};

function render$n(_ctx, _cache, $props, $setup, $data, $options) {
  const _directive_click_outside = resolveDirective("click-outside");

  return withDirectives((openBlock(), createElementBlock("div", {
    class: normalizeClass(["navbar-item has-dropdown", {
            'is-hoverable': $data.isHoverable,
            'is-active': $data.newActive
        }]),
    onMouseenter: _cache[0] || (_cache[0] = (...args) => ($options.checkHoverable && $options.checkHoverable(...args)))
  }, [
    (openBlock(), createBlock(resolveDynamicComponent($props.tag), mergeProps({
      class: ["navbar-link", {
                'is-arrowless': $props.arrowless,
                'is-active': $data.newActive && $props.collapsible
            }]
    }, _ctx.$attrs, {
      "aria-haspopup": "true",
      onClick: withModifiers($options.toggleMenu, ["prevent"]),
      onKeyup: withKeys($options.toggleMenu, ["enter"]),
      tabindex: "0"
    }), {
      default: withCtx(() => [
        ($props.label)
          ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createTextVNode(toDisplayString($props.label), 1 /* TEXT */)
            ], 64 /* STABLE_FRAGMENT */))
          : renderSlot(_ctx.$slots, "label", { key: 1 })
      ]),
      _: 3 /* FORWARDED */
    }, 16 /* FULL_PROPS */, ["class", "onClick", "onKeyup"])),
    createElementVNode("div", {
      class: normalizeClass(["navbar-dropdown is-hidden-touch", {
                'is-right': $props.right,
                'is-boxed': $props.boxed,
            }])
    }, [
      renderSlot(_ctx.$slots, "default")
    ], 2 /* CLASS */),
    withDirectives(createElementVNode("div", {
      class: normalizeClass(["navbar-dropdown is-hidden-desktop", {
                'is-right': $props.right,
                'is-boxed': $props.boxed,
            }])
    }, [
      renderSlot(_ctx.$slots, "default")
    ], 2 /* CLASS */), [
      [vShow, !$props.collapsible || ($props.collapsible && $data.newActive)]
    ])
  ], 34 /* CLASS, HYDRATE_EVENTS */)), [
    [_directive_click_outside, $options.closeMenu]
  ])
}

script$r.render = render$n;
script$r.__file = "src/components/navbar/NavbarDropdown.vue";

var Plugin$E = {
  install: function install(Vue) {
    registerComponent(Vue, script$t);
    registerComponent(Vue, script$s);
    registerComponent(Vue, script$r);
  }
};
use(Plugin$E);
var Plugin$F = Plugin$E;

var script$q = {
    name: 'BNumberinput',
    components: {
        [script$17.name]: script$17,
        [script$16.name]: script$16
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    inject: {
        field: {
            from: 'BField',
            default: false
        }
    },
    props: {
        modelValue: Number,
        min: {
            type: [Number, String]
        },
        max: [Number, String],
        step: [Number, String],
        minStep: [Number, String],
        exponential: [Boolean, Number],
        disabled: Boolean,
        type: {
            type: String,
            default: 'is-primary'
        },
        editable: {
            type: Boolean,
            default: true
        },
        controls: {
            type: Boolean,
            default: true
        },
        controlsAlignment: {
            type: String,
            default: 'center',
            validator: (value) => {
                return [
                    'left',
                    'right',
                    'center'
                ].indexOf(value) >= 0
            }
        },
        controlsRounded: {
            type: Boolean,
            default: false
        },
        controlsPosition: String,
        placeholder: [Number, String],
        ariaMinusLabel: String,
        ariaPlusLabel: String,
        longPress: {
            type: Boolean,
            default: true
        }
    },
    emits: ['blur', 'focus', 'update:modelValue'],
    data() {
        return {
            newValue: this.modelValue,
            newStep: this.step || 1,
            newMinStep: this.minStep,
            timesPressed: 1,
            _elementRef: 'input'
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.newValue
            },
            set(value) {
                // Parses the number, so that "0" => 0, and "invalid" => null
                let newValue = (Number(value) === 0) ? 0 : (Number(value) || null);
                if (value === '' || value === undefined || value === null) {
                    newValue = null;
                }
                this.newValue = newValue;
                if (newValue === null) {
                    this.$emit('update:modelValue', newValue);
                } else if (!isNaN(newValue) && newValue !== '-0') {
                    this.$emit('update:modelValue', Number(newValue));
                }
                this.$nextTick(() => {
                    if (this.$refs.input) {
                        this.$refs.input.checkHtml5Validity();
                    }
                });
            }
        },
        controlsLeft() {
            if (this.controls && this.controlsAlignment !== 'right') {
                return this.controlsAlignment === 'left' ? ['minus', 'plus'] : ['minus']
            }
            return []
        },
        controlsRight() {
            if (this.controls && this.controlsAlignment !== 'left') {
                return this.controlsAlignment === 'right' ? ['minus', 'plus'] : ['plus']
            }
            return []
        },
        fieldClasses() {
            return [
                { 'has-addons': this.controlsPosition === 'compact' },
                { 'is-grouped': this.controlsPosition !== 'compact' },
                { 'is-expanded': this.expanded }
            ]
        },
        buttonClasses() {
            return [this.type, this.size, { 'is-rounded': this.controlsRounded }]
        },
        minNumber() {
            return typeof this.min === 'string' ? parseFloat(this.min) : this.min
        },
        maxNumber() {
            return typeof this.max === 'string' ? parseFloat(this.max) : this.max
        },
        stepNumber() {
            if (this.newStep === 'any') {
                return 1
            }
            return typeof this.newStep === 'string' ? parseFloat(this.newStep) : this.newStep
        },
        minStepNumber() {
            if (this.newStep === 'any' && typeof this.newMinStep === 'undefined') {
                return 'any'
            }
            const step = typeof this.newMinStep !== 'undefined' ? this.newMinStep : this.newStep;
            return typeof step === 'string' ? parseFloat(step) : step
        },
        disabledMin() {
            return this.computedValue - this.stepNumber < this.minNumber
        },
        disabledMax() {
            return this.computedValue + this.stepNumber > this.maxNumber
        },
        stepDecimals() {
            const step = this.minStepNumber.toString();
            const index = step.indexOf('.');
            if (index >= 0) {
                return step.substring(index + 1).length
            }
            return 0
        },

        disabledOrUndefined() {
            // On Vue 3, setting a boolean attribute `false` does not remove it,
            // `null` or `undefined` has to be given to remove it.
            return this.disabled || undefined
        }
    },
    watch: {
    /**
     * When v-model is changed:
     *   1. Set internal value.
     */
        modelValue: {
            immediate: true,
            handler(value) {
                this.newValue = value;
            }
        },
        step(value) {
            this.newStep = value;
        },
        minStep(value) {
            this.newMinStep = value;
        }
    },
    methods: {
        isDisabled(control) {
            return this.disabled || (control === 'plus' ? this.disabledMax : this.disabledMin)
        },
        decrement() {
            if (this.computedValue === null || typeof this.computedValue === 'undefined') {
                if (this.maxNumber !== null && typeof this.maxNumber !== 'undefined') {
                    this.computedValue = this.maxNumber;
                    return
                }
                this.computedValue = 0;
            }
            if (typeof this.minNumber === 'undefined' || (this.computedValue - this.stepNumber) >= this.minNumber) {
                const value = this.computedValue - this.stepNumber;
                this.computedValue = parseFloat(value.toFixed(this.stepDecimals));
            }
        },
        increment() {
            if (this.computedValue === null || typeof this.computedValue === 'undefined' || this.computedValue < this.minNumber) {
                if (this.minNumber !== null && typeof this.minNumber !== 'undefined') {
                    this.computedValue = this.minNumber;
                    return
                }
                this.computedValue = 0;
            }
            if (typeof this.maxNumber === 'undefined' || (this.computedValue + this.stepNumber) <= this.maxNumber) {
                const value = this.computedValue + this.stepNumber;
                this.computedValue = parseFloat(value.toFixed(this.stepDecimals));
            }
        },
        onControlClick(event, inc) {
            // IE 11 -> filter click event
            if (event.detail !== 0 || event.type !== 'click') return
            if (inc) this.increment();
            else this.decrement();
        },
        longPressTick(inc) {
            if (inc) this.increment();
            else this.decrement();

            if (!this.longPress) return
            this._$intervalRef = setTimeout(() => {
                this.longPressTick(inc);
            }, this.exponential ? (250 / (this.exponential * this.timesPressed++)) : 250);
        },
        onStartLongPress(event, inc) {
            if (event.button !== 0 && event.type !== 'touchstart') return
            clearTimeout(this._$intervalRef);
            this.longPressTick(inc);
        },
        onStopLongPress() {
            if (!this._$intervalRef) return
            this.timesPressed = 1;
            clearTimeout(this._$intervalRef);
            this._$intervalRef = null;
        }
    },
    mounted() {
        // tells the field that it is wrapping a number input
        // if the field is the direct parent.
        if (this.field === this.$parent) {
            this.$parent.wrapNumberinput({
                controlsPosition: this.controlsPosition,
                size: this.size
            });
        }
    }
};

const _hoisted_1$k = ["disabled", "aria-label", "onMousedown", "onTouchstart", "onClick"];
const _hoisted_2$h = ["disabled", "aria-label", "onMousedown", "onTouchstart", "onClick"];

function render$m(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");
  const _component_b_input = resolveComponent("b-input");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["b-numberinput field", $options.fieldClasses])
  }, [
    (openBlock(true), createElementBlock(Fragment, null, renderList($options.controlsLeft, (control) => {
      return (openBlock(), createElementBlock("p", {
        key: control,
        class: normalizeClass(['control', control]),
        onMouseup: _cache[0] || (_cache[0] = (...args) => ($options.onStopLongPress && $options.onStopLongPress(...args))),
        onMouseleave: _cache[1] || (_cache[1] = (...args) => ($options.onStopLongPress && $options.onStopLongPress(...args))),
        onTouchend: _cache[2] || (_cache[2] = (...args) => ($options.onStopLongPress && $options.onStopLongPress(...args))),
        onTouchcancel: _cache[3] || (_cache[3] = (...args) => ($options.onStopLongPress && $options.onStopLongPress(...args)))
      }, [
        createElementVNode("button", {
          type: "button",
          class: normalizeClass(["button", $options.buttonClasses]),
          disabled: $options.isDisabled(control) || undefined,
          "aria-label": control === 'plus' ? $props.ariaPlusLabel : $props.ariaMinusLabel,
          onMousedown: $event => (
                    !$options.isDisabled(control) && $options.onStartLongPress($event, control === 'plus')
                ),
          onTouchstart: withModifiers($event => (
                    !$options.isDisabled(control) && $options.onStartLongPress($event, control === 'plus')
                ), ["prevent"]),
          onClick: $event => (
                    !$options.isDisabled(control) && $options.onControlClick($event, control === 'plus')
                )
        }, [
          createVNode(_component_b_icon, {
            both: "",
            icon: control,
            pack: _ctx.iconPack,
            size: _ctx.iconSize
          }, null, 8 /* PROPS */, ["icon", "pack", "size"])
        ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$k)
      ], 34 /* CLASS, HYDRATE_EVENTS */))
    }), 128 /* KEYED_FRAGMENT */)),
    createVNode(_component_b_input, mergeProps({
      type: "number",
      ref: "input",
      modelValue: $options.computedValue,
      "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => (($options.computedValue) = $event))
    }, _ctx.$attrs, {
      step: $options.minStepNumber,
      max: $props.max,
      min: $props.min,
      size: _ctx.size,
      disabled: $options.disabledOrUndefined,
      readonly: !$props.editable,
      loading: _ctx.loading,
      rounded: _ctx.rounded,
      icon: _ctx.icon,
      "icon-pack": _ctx.iconPack,
      autocomplete: _ctx.autocomplete,
      expanded: _ctx.expanded,
      placeholder: $props.placeholder,
      "use-html5-validation": _ctx.useHtml5Validation,
      onFocus: _cache[5] || (_cache[5] = $event => (_ctx.$emit('focus', $event))),
      onBlur: _cache[6] || (_cache[6] = $event => (_ctx.$emit('blur', $event)))
    }), null, 16 /* FULL_PROPS */, ["modelValue", "step", "max", "min", "size", "disabled", "readonly", "loading", "rounded", "icon", "icon-pack", "autocomplete", "expanded", "placeholder", "use-html5-validation"]),
    (openBlock(true), createElementBlock(Fragment, null, renderList($options.controlsRight, (control) => {
      return (openBlock(), createElementBlock("p", {
        key: control,
        class: normalizeClass(['control', control]),
        onMouseup: _cache[7] || (_cache[7] = (...args) => ($options.onStopLongPress && $options.onStopLongPress(...args))),
        onMouseleave: _cache[8] || (_cache[8] = (...args) => ($options.onStopLongPress && $options.onStopLongPress(...args))),
        onTouchend: _cache[9] || (_cache[9] = (...args) => ($options.onStopLongPress && $options.onStopLongPress(...args))),
        onTouchcancel: _cache[10] || (_cache[10] = (...args) => ($options.onStopLongPress && $options.onStopLongPress(...args)))
      }, [
        createElementVNode("button", {
          type: "button",
          class: normalizeClass(["button", $options.buttonClasses]),
          disabled: $options.isDisabled(control) || undefined,
          "aria-label": control === 'plus' ? $props.ariaPlusLabel : $props.ariaMinusLabel,
          onMousedown: $event => (
                    !$options.isDisabled(control) && $options.onStartLongPress($event, control === 'plus')
                ),
          onTouchstart: withModifiers($event => (
                    !$options.isDisabled(control) && $options.onStartLongPress($event, control === 'plus')
                ), ["prevent"]),
          onClick: $event => (
                    !$options.isDisabled(control) && $options.onControlClick($event, control === 'plus')
                )
        }, [
          createVNode(_component_b_icon, {
            both: "",
            icon: control,
            pack: _ctx.iconPack,
            size: _ctx.iconSize
          }, null, 8 /* PROPS */, ["icon", "pack", "size"])
        ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_2$h)
      ], 34 /* CLASS, HYDRATE_EVENTS */))
    }), 128 /* KEYED_FRAGMENT */))
  ], 2 /* CLASS */))
}

script$q.render = render$m;
script$q.__file = "src/components/numberinput/Numberinput.vue";

var Plugin$C = {
  install: function install(Vue) {
    registerComponent(Vue, script$q);
  }
};
use(Plugin$C);
var Plugin$D = Plugin$C;

var script$p = {
    name: 'BPaginationButton',
    props: {
        page: {
            type: Object,
            required: true
        },
        tag: {
            type: String,
            default: 'a',
            validator: (value) => {
                return config.defaultLinkTags.indexOf(value) >= 0
            }
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        href() {
            if (this.tag === 'a') {
                return '#'
            } else {
                return undefined
            }
        },
        isDisabled() {
            return this.disabled || this.page.disabled
        },
        disabledOrUndefined() {
            return this.isDisabled || undefined
        }
    }
};

function render$l(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(resolveDynamicComponent($props.tag), mergeProps({
    role: "button",
    href: $options.href,
    disabled: $options.disabledOrUndefined,
    class: ["pagination-link", { 'is-current': $props.page.isCurrent, [$props.page.class]: true }]
  }, _ctx.$attrs, {
    onClick: withModifiers($props.page.click, ["prevent"]),
    "aria-label": $props.page['aria-label'],
    "aria-current": $props.page.isCurrent
  }), {
    default: withCtx(() => [
      renderSlot(_ctx.$slots, "default", {}, () => [
        createTextVNode(toDisplayString($props.page.number), 1 /* TEXT */)
      ])
    ]),
    _: 3 /* FORWARDED */
  }, 16 /* FULL_PROPS */, ["href", "disabled", "class", "onClick", "aria-label", "aria-current"]))
}

script$p.render = render$l;
script$p.__file = "src/components/pagination/PaginationButton.vue";

function debounce (func, wait, immediate) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    var later = function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var script$o = {
    name: 'BPagination',
    components: {
        [script$17.name]: script$17,
        [script$p.name]: script$p
    },
    props: {
        total: [Number, String],
        perPage: {
            type: [Number, String],
            default: 20
        },
        modelValue: {
            type: [Number, String],
            default: 1
        },
        rangeBefore: {
            type: [Number, String],
            default: 1
        },
        rangeAfter: {
            type: [Number, String],
            default: 1
        },
        size: String,
        simple: Boolean,
        rounded: Boolean,
        order: String,
        iconPack: String,
        iconPrev: {
            type: String,
            default: () => {
                return config.defaultIconPrev
            }
        },
        iconNext: {
            type: String,
            default: () => {
                return config.defaultIconNext
            }
        },
        ariaNextLabel: String,
        ariaPreviousLabel: String,
        ariaPageLabel: String,
        ariaCurrentLabel: String,
        pageInput: {
            type: Boolean,
            default: false
        },
        pageInputPosition: String,
        debouncePageInput: [Number, String]
    },
    data() {
        return {
            inputValue: this.modelValue
        }
    },
    emits: ['change', 'update:modelValue'],
    computed: {
        rootClasses() {
            return [
                this.order,
                this.size,
                this.pageInputPosition,
                {
                    'is-simple': this.simple,
                    'is-rounded': this.rounded,
                    'has-input': this.pageInput
                }
            ]
        },

        beforeCurrent() {
            return parseInt(this.rangeBefore)
        },

        afterCurrent() {
            return parseInt(this.rangeAfter)
        },

        /**
        * Total page size (count).
        */
        pageCount() {
            return Math.ceil(this.total / this.perPage)
        },

        /**
        * First item of the page (count).
        */
        firstItem() {
            const firstItem = this.modelValue * this.perPage - this.perPage + 1;
            return firstItem >= 0 ? firstItem : 0
        },

        /**
        * Check if previous button is available.
        */
        hasPrev() {
            return this.modelValue > 1
        },

        /**
         * Check if first page button should be visible.
        */
        hasFirst() {
            return this.modelValue >= 2 + this.beforeCurrent
        },

        /**
        * Check if first ellipsis should be visible.
        */
        hasFirstEllipsis() {
            return this.modelValue >= this.beforeCurrent + 4
        },

        /**
        * Check if last page button should be visible.
        */
        hasLast() {
            return this.modelValue <= this.pageCount - (1 + this.afterCurrent)
        },

        /**
        * Check if last ellipsis should be visible.
        */
        hasLastEllipsis() {
            return this.modelValue < this.pageCount - (2 + this.afterCurrent)
        },

        /**
        * Check if next button is available.
        */
        hasNext() {
            return this.modelValue < this.pageCount
        },

        /**
        * Get near pages, 1 before and 1 after the current.
        * Also add the click event to the array.
        */
        pagesInRange() {
            if (this.simple) return

            let left = Math.max(1, this.modelValue - this.beforeCurrent);
            if (left - 1 === 2) {
                left--; // Do not show the ellipsis if there is only one to hide
            }
            let right = Math.min(this.modelValue + this.afterCurrent, this.pageCount);
            if (this.pageCount - right === 2) {
                right++; // Do not show the ellipsis if there is only one to hide
            }

            const pages = [];
            for (let i = left; i <= right; i++) {
                pages.push(this.getPage(i));
            }
            return pages
        }
    },
    watch: {
        /**
        * If current page is trying to be greater than page count, set to last.
        */
        pageCount(value) {
            if (this.modelValue > value) this.last();
        },

        modelValue(value) {
            this.inputValue = value;
        },

        debouncePageInput: {
            handler(value) {
                this.debounceHandlePageInput = debounce(
                    this.handleOnInputPageChange,
                    value
                );
            },
            immediate: true
        }
    },
    methods: {
        /**
        * Previous button click listener.
        */
        prev(event) {
            this.changePage(this.modelValue - 1, event);
        },
        /**
         * Next button click listener.
        */
        next(event) {
            this.changePage(this.modelValue + 1, event);
        },
        /**
         * First button click listener.
        */
        first(event) {
            this.changePage(1, event);
        },
        /**
        * Last button click listener.
        */
        last(event) {
            this.changePage(this.pageCount, event);
        },

        changePage(num, event) {
            if (this.modelValue === num || num < 1 || num > this.pageCount) return

            this.$emit('update:modelValue', num);
            this.$emit('change', num);

            // Set focus on element to keep tab order
            if (event && event.target) {
                this.$nextTick(() => event.target.focus());
            }
        },

        getPage(num, options = {}) {
            return {
                number: num,
                isCurrent: this.modelValue === num,
                click: (event) => this.changePage(num, event),
                input: (event, inputNum) => this.changePage(+inputNum, event),
                disabled: options.disabled || false,
                class: options.class || '',
                'aria-label':
          options['aria-label'] ||
          this.getAriaPageLabel(num, this.modelValue === num)
            }
        },

        /**
        * Get text for aria-label according to page number.
        */
        getAriaPageLabel(pageNumber, isCurrent) {
            if (this.ariaPageLabel && (!isCurrent || !this.ariaCurrentLabel)) {
                return this.ariaPageLabel + ' ' + pageNumber + '.'
            } else if (this.ariaPageLabel && isCurrent && this.ariaCurrentLabel) {
                return (
                    this.ariaCurrentLabel +
          ', ' +
          this.ariaPageLabel +
          ' ' +
          pageNumber +
          '.'
                )
            }
            return null
        },

        handleOnInputPageChange(event) {
            this.getPage(this.inputValue).input(event, this.inputValue);
        },

        handleOnInputDebounce(event) {
            if (this.debouncePageInput) {
                this.debounceHandlePageInput(event);
            } else {
                this.handleOnInputPageChange(event);
            }
        },
        handleOnKeyPress(event) {
            // --- This is required to only allow numeric inputs for the page input - --- //
            // --- size attribute does not work with input type number. --- //
            const ASCIICode = event.which || event.keyCode;

            if (ASCIICode >= 48 && ASCIICode <= 57) {
                return true
            } else {
                return event.preventDefault()
            }
        },
        handleAllowableInputPageRange(event) {
            if (+event.target.value > 0 && +event.target.value <= this.pageCount) {
                this.handleOnInputValue(event);
            } else {
                // --- It is nessacery to set inputValue to 1 and then to '' so that the DOM- --- //
                // --- will update the input component even when Backspace is used and then-
                // --- 0 us entered. --- //
                this.inputValue = 1;
                this.inputValue = '';
            }
        },
        handleOnInputValue(event) {
            const inputValue = +event.target.value;
            this.inputValue = inputValue;
            if (Number.isInteger(this.inputValue)) {
                this.handleOnInputDebounce(event);
            } else {
                // --- if NaN, then set inputValue back to current --- //
                this.inputValue = this.modelValue;
            }
        }
    }
};

const _hoisted_1$j = { class: "control pagination-input" };
const _hoisted_2$g = ["value", "size", "maxlength"];
const _hoisted_3$9 = {
  key: 4,
  class: "info"
};
const _hoisted_4$5 = {
  key: 5,
  class: "pagination-list"
};
const _hoisted_5$3 = { key: 0 };
const _hoisted_6$2 = { key: 1 };
const _hoisted_7$2 = /*#__PURE__*/createElementVNode("span", { class: "pagination-ellipsis" }, "…", -1 /* HOISTED */);
const _hoisted_8$2 = [
  _hoisted_7$2
];
const _hoisted_9$2 = { key: 2 };
const _hoisted_10$1 = /*#__PURE__*/createElementVNode("span", { class: "pagination-ellipsis" }, "…", -1 /* HOISTED */);
const _hoisted_11$1 = [
  _hoisted_10$1
];
const _hoisted_12$1 = { key: 3 };

function render$k(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");
  const _component_BPaginationButton = resolveComponent("BPaginationButton");

  return (openBlock(), createElementBlock("nav", {
    class: normalizeClass(["pagination", $options.rootClasses])
  }, [
    (_ctx.$slots.previous)
      ? renderSlot(_ctx.$slots, "previous", {
          key: 0,
          page: 
                $options.getPage($props.modelValue - 1, {
                    disabled: !$options.hasPrev,
                    class: 'pagination-previous',
                    'aria-label': $props.ariaPreviousLabel,
                })
            
        }, () => [
          createVNode(_component_b_icon, {
            icon: $props.iconPrev,
            pack: $props.iconPack,
            both: "",
            "aria-hidden": "true"
          }, null, 8 /* PROPS */, ["icon", "pack"])
        ])
      : (openBlock(), createBlock(_component_BPaginationButton, {
          key: 1,
          class: "pagination-previous",
          disabled: !$options.hasPrev,
          page: $options.getPage($props.modelValue - 1),
          "aria-label": $props.ariaPreviousLabel
        }, {
          default: withCtx(() => [
            createVNode(_component_b_icon, {
              icon: $props.iconPrev,
              pack: $props.iconPack,
              both: "",
              "aria-hidden": "true"
            }, null, 8 /* PROPS */, ["icon", "pack"])
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["disabled", "page", "aria-label"])),
    (_ctx.$slots.next)
      ? renderSlot(_ctx.$slots, "next", {
          key: 2,
          page: 
                $options.getPage($props.modelValue + 1, {
                    disabled: !$options.hasNext,
                    class: 'pagination-next',
                    'aria-label': $props.ariaNextLabel,
                })
            
        }, () => [
          createVNode(_component_b_icon, {
            icon: $props.iconNext,
            pack: $props.iconPack,
            both: "",
            "aria-hidden": "true"
          }, null, 8 /* PROPS */, ["icon", "pack"])
        ])
      : (openBlock(), createBlock(_component_BPaginationButton, {
          key: 3,
          class: "pagination-next",
          disabled: !$options.hasNext,
          page: $options.getPage($props.modelValue + 1),
          "aria-label": $props.ariaNextLabel
        }, {
          default: withCtx(() => [
            createVNode(_component_b_icon, {
              icon: $props.iconNext,
              pack: $props.iconPack,
              both: "",
              "aria-hidden": "true"
            }, null, 8 /* PROPS */, ["icon", "pack"])
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["disabled", "page", "aria-label"])),
    createElementVNode("div", _hoisted_1$j, [
      ($props.pageInput)
        ? (openBlock(), createElementBlock("input", {
            key: 0,
            class: "input",
            value: $data.inputValue,
            onInput: _cache[0] || (_cache[0] = (...args) => ($options.handleAllowableInputPageRange && $options.handleAllowableInputPageRange(...args))),
            onKeypress: _cache[1] || (_cache[1] = (...args) => ($options.handleOnKeyPress && $options.handleOnKeyPress(...args))),
            size: $options.pageCount.toString().length,
            maxlength: $options.pageCount.toString().length
          }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_2$g))
        : createCommentVNode("v-if", true)
    ]),
    ($props.simple)
      ? (openBlock(), createElementBlock("small", _hoisted_3$9, [
          ($props.perPage == 1)
            ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                createTextVNode(toDisplayString($options.firstItem) + " / " + toDisplayString($props.total), 1 /* TEXT */)
              ], 64 /* STABLE_FRAGMENT */))
            : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                createTextVNode(toDisplayString($options.firstItem) + "-" + toDisplayString(Math.min($props.modelValue * $props.perPage, $props.total)) + " / " + toDisplayString($props.total), 1 /* TEXT */)
              ], 64 /* STABLE_FRAGMENT */))
        ]))
      : (openBlock(), createElementBlock("ul", _hoisted_4$5, [
          createCommentVNode("First"),
          ($options.hasFirst)
            ? (openBlock(), createElementBlock("li", _hoisted_5$3, [
                (_ctx.$slots.default)
                  ? renderSlot(_ctx.$slots, "default", {
                      key: 0,
                      page: $options.getPage(1)
                    })
                  : (openBlock(), createBlock(_component_BPaginationButton, {
                      key: 1,
                      page: $options.getPage(1)
                    }, null, 8 /* PROPS */, ["page"]))
              ]))
            : createCommentVNode("v-if", true),
          ($options.hasFirstEllipsis)
            ? (openBlock(), createElementBlock("li", _hoisted_6$2, _hoisted_8$2))
            : createCommentVNode("v-if", true),
          createCommentVNode("Pages"),
          (openBlock(true), createElementBlock(Fragment, null, renderList($options.pagesInRange, (page) => {
            return (openBlock(), createElementBlock("li", {
              key: page.number
            }, [
              (_ctx.$slots.default)
                ? renderSlot(_ctx.$slots, "default", {
                    key: 0,
                    page: page
                  })
                : (openBlock(), createBlock(_component_BPaginationButton, {
                    key: 1,
                    page: page
                  }, null, 8 /* PROPS */, ["page"]))
            ]))
          }), 128 /* KEYED_FRAGMENT */)),
          createCommentVNode("Last"),
          ($options.hasLastEllipsis)
            ? (openBlock(), createElementBlock("li", _hoisted_9$2, _hoisted_11$1))
            : createCommentVNode("v-if", true),
          ($options.hasLast)
            ? (openBlock(), createElementBlock("li", _hoisted_12$1, [
                (_ctx.$slots.default)
                  ? renderSlot(_ctx.$slots, "default", {
                      key: 0,
                      page: $options.getPage($options.pageCount)
                    })
                  : (openBlock(), createBlock(_component_BPaginationButton, {
                      key: 1,
                      page: $options.getPage($options.pageCount)
                    }, null, 8 /* PROPS */, ["page"]))
              ]))
            : createCommentVNode("v-if", true)
        ]))
  ], 2 /* CLASS */))
}

script$o.render = render$k;
script$o.__file = "src/components/pagination/Pagination.vue";

var Plugin$A = {
  install: function install(Vue) {
    registerComponent(Vue, script$o);
    registerComponent(Vue, script$p);
  }
};
use(Plugin$A);
var Plugin$B = Plugin$A;

var script$n = {
    name: 'BProgressBar',
    mixins: [InjectedChildMixin('progress')],
    props: {
        type: {
            type: [String, Object],
            default: undefined
        },
        value: {
            type: Number,
            default: undefined
        },
        showValue: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        newType() {
            return [
                this.parent.size,
                this.type || this.parent.type
            ]
        },
        newShowValue() {
            return this.showValue || this.parent.showValue
        },
        newValue() {
            return this.parent.calculateValue(this.value)
        },
        barWidth() {
            return `${this.value * 100 / this.parent.max}%`
        }
    }
};

const _hoisted_1$i = ["aria-valuenow", "aria-valuemax"];
const _hoisted_2$f = {
  key: 0,
  class: "progress-value"
};

function render$j(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["progress-bar", $options.newType]),
    role: "progressbar",
    "aria-valuenow": $props.value,
    "aria-valuemax": _ctx.parent.max,
    "aria-valuemin": "0",
    style: normalizeStyle({width: $options.barWidth})
  }, [
    ($options.newShowValue)
      ? (openBlock(), createElementBlock("p", _hoisted_2$f, [
          renderSlot(_ctx.$slots, "default", {}, () => [
            createTextVNode(toDisplayString($options.newValue), 1 /* TEXT */)
          ])
        ]))
      : createCommentVNode("v-if", true)
  ], 14 /* CLASS, STYLE, PROPS */, _hoisted_1$i))
}

script$n.render = render$j;
script$n.__file = "src/components/progress/ProgressBar.vue";

var Plugin$y = {
  install: function install(Vue) {
    registerComponent(Vue, script$x);
    registerComponent(Vue, script$n);
  }
};
use(Plugin$y);
var Plugin$z = Plugin$y;

var script$m = {
    name: 'BRadio',
    mixins: [CheckRadioMixin]
};

const _hoisted_1$h = ["disabled"];
const _hoisted_2$e = ["disabled", "required", "name", "value"];
const _hoisted_3$8 = { class: "control-label" };

function render$i(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("label", {
    class: normalizeClass(["b-radio radio", [_ctx.size, { 'is-disabled': _ctx.disabled }]]),
    ref: "label",
    disabled: _ctx.disabledOrUndefined,
    onClick: _cache[2] || (_cache[2] = (...args) => (_ctx.focus && _ctx.focus(...args))),
    onKeydown: _cache[3] || (_cache[3] = withKeys(withModifiers($event => (_ctx.$refs.label.click()), ["prevent"]), ["enter"]))
  }, [
    withDirectives(createElementVNode("input", {
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.computedValue) = $event)),
      type: "radio",
      ref: "input",
      onClick: _cache[1] || (_cache[1] = withModifiers(() => {}, ["stop"])),
      disabled: _ctx.disabledOrUndefined,
      required: _ctx.requiredOrUndefined,
      name: _ctx.name,
      value: _ctx.nativeValue
    }, null, 8 /* PROPS */, _hoisted_2$e), [
      [vModelRadio, _ctx.computedValue]
    ]),
    createElementVNode("span", {
      class: normalizeClass(["check", _ctx.type])
    }, null, 2 /* CLASS */),
    createElementVNode("span", _hoisted_3$8, [
      renderSlot(_ctx.$slots, "default")
    ])
  ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$h))
}

script$m.render = render$i;
script$m.__file = "src/components/radio/Radio.vue";

var script$l = {
    name: 'BRadioButton',
    mixins: [CheckRadioMixin],
    props: {
        type: {
            type: String,
            default: 'is-primary'
        },
        expanded: Boolean
    },
    data() {
        return {
            isFocused: false
        }
    },
    computed: {
        isSelected() {
            return this.newValue === this.nativeValue
        },
        labelClass() {
            return [
                this.isSelected ? this.type : null,
                this.size,
                {
                    'is-selected': this.isSelected,
                    'is-disabled': this.disabled,
                    'is-focused': this.isFocused
                }
            ]
        }
    }
};

const _hoisted_1$g = ["disabled"];
const _hoisted_2$d = ["disabled", "required", "name", "value"];

function render$h(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["control", { 'is-expanded': $props.expanded }])
  }, [
    createElementVNode("label", {
      class: normalizeClass(["b-radio radio button", $options.labelClass]),
      ref: "label",
      disabled: _ctx.disabledOrUndefined,
      onClick: _cache[4] || (_cache[4] = (...args) => (_ctx.focus && _ctx.focus(...args))),
      onKeydown: _cache[5] || (_cache[5] = withKeys(withModifiers($event => (_ctx.$refs.label.click()), ["prevent"]), ["enter"]))
    }, [
      renderSlot(_ctx.$slots, "default"),
      withDirectives(createElementVNode("input", {
        "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((_ctx.computedValue) = $event)),
        type: "radio",
        ref: "input",
        onClick: _cache[1] || (_cache[1] = withModifiers(() => {}, ["stop"])),
        disabled: _ctx.disabledOrUndefined,
        required: _ctx.requiredOrUndefined,
        name: _ctx.name,
        value: _ctx.nativeValue,
        onFocus: _cache[2] || (_cache[2] = $event => ($data.isFocused = true)),
        onBlur: _cache[3] || (_cache[3] = $event => ($data.isFocused = false))
      }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_2$d), [
        [vModelRadio, _ctx.computedValue]
      ])
    ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$g)
  ], 2 /* CLASS */))
}

script$l.render = render$h;
script$l.__file = "src/components/radio/RadioButton.vue";

var Plugin$w = {
  install: function install(Vue) {
    registerComponent(Vue, script$m);
    registerComponent(Vue, script$l);
  }
};
use(Plugin$w);
var Plugin$x = Plugin$w;

var script$k = {
    name: 'BRate',
    components: {
        [script$17.name]: script$17
    },
    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 5
        },
        icon: {
            type: String,
            default: 'star'
        },
        iconPack: String,
        size: String,
        spaced: Boolean,
        rtl: Boolean,
        disabled: Boolean,
        showScore: Boolean,
        showText: Boolean,
        customText: String,
        texts: Array,
        locale: {
            type: [String, Array],
            default: () => {
                return config.defaultLocale
            }
        }
    },
    emits: ['change', 'update:modelValue'],
    data() {
        return {
            newValue: this.modelValue,
            hoverValue: 0
        }
    },
    computed: {
        halfStyle() {
            return `width:${this.valueDecimal}%`
        },
        showMe() {
            let result = '';
            if (this.showScore) {
                result = this.disabled ? this.modelValue : this.newValue;
                if (result === 0) {
                    result = '';
                } else {
                    result = new Intl.NumberFormat(this.locale).format(this.modelValue);
                }
            } else if (this.showText) {
                result = this.texts[Math.ceil(this.newValue) - 1];
            }
            return result
        },
        valueDecimal() {
            return this.modelValue * 100 - Math.floor(this.modelValue) * 100
        }
    },
    watch: {
        // When v-model is changed set the new value.
        modelValue(value) {
            this.newValue = value;
        }
    },
    methods: {
        resetNewValue() {
            if (this.disabled) return
            this.hoverValue = 0;
        },
        previewRate(index, event) {
            if (this.disabled) return
            this.hoverValue = index;
            event.stopPropagation();
        },
        confirmValue(index) {
            if (this.disabled) return
            this.newValue = index;
            this.$emit('change', this.newValue);
            this.$emit('update:modelValue', this.newValue);
        },
        checkHalf(index) {
            const showWhenDisabled = this.disabled && this.valueDecimal > 0 &&
            index - 1 < this.modelValue && index > this.modelValue;
            return showWhenDisabled
        },
        rateClass(index) {
            let output = '';
            const currentValue = this.hoverValue !== 0 ? this.hoverValue : this.newValue;
            if (index <= currentValue) {
                output = 'set-on';
            } else if (this.disabled && (Math.ceil(this.modelValue) === index)) {
                output = 'set-half';
            }
            return output
        }
    }
};

const _hoisted_1$f = ["onMousemove", "onClick"];
const _hoisted_2$c = { key: 0 };

function render$g(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["rate", { 'is-disabled': $props.disabled, 'is-spaced': $props.spaced, 'is-rtl': $props.rtl }])
  }, [
    (openBlock(true), createElementBlock(Fragment, null, renderList($props.max, (item, index) => {
      return (openBlock(), createElementBlock("div", {
        class: normalizeClass(["rate-item", $options.rateClass(item)]),
        key: index,
        onMousemove: $event => ($options.previewRate(item, $event)),
        onMouseleave: _cache[0] || (_cache[0] = (...args) => ($options.resetNewValue && $options.resetNewValue(...args))),
        onClick: withModifiers($event => ($options.confirmValue(item)), ["prevent"])
      }, [
        createVNode(_component_b_icon, {
          pack: $props.iconPack,
          icon: $props.icon,
          size: $props.size
        }, null, 8 /* PROPS */, ["pack", "icon", "size"]),
        ($options.checkHalf(item))
          ? (openBlock(), createBlock(_component_b_icon, {
              key: 0,
              class: "is-half",
              pack: $props.iconPack,
              icon: $props.icon,
              size: $props.size,
              style: normalizeStyle($options.halfStyle)
            }, null, 8 /* PROPS */, ["pack", "icon", "size", "style"]))
          : createCommentVNode("v-if", true)
      ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$f))
    }), 128 /* KEYED_FRAGMENT */)),
    ($props.showText || $props.showScore || $props.customText)
      ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["rate-text", $props.size])
        }, [
          createElementVNode("span", null, toDisplayString($options.showMe), 1 /* TEXT */),
          ($props.customText && !$props.showText)
            ? (openBlock(), createElementBlock("span", _hoisted_2$c, toDisplayString($props.customText), 1 /* TEXT */))
            : createCommentVNode("v-if", true)
        ], 2 /* CLASS */))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$k.render = render$g;
script$k.__file = "src/components/rate/Rate.vue";

var Plugin$u = {
  install: function install(Vue) {
    registerComponent(Vue, script$k);
  }
};
use(Plugin$u);
var Plugin$v = Plugin$u;

var Plugin$s = {
  install: function install(Vue) {
    registerComponent(Vue, script$Q);
  }
};
use(Plugin$s);
var Plugin$t = Plugin$s;

var script$j = {
    name: 'BSkeleton',
    functional: true,
    props: {
        active: {
            type: Boolean,
            default: true
        },
        animated: {
            type: Boolean,
            default: true
        },
        width: [Number, String],
        height: [Number, String],
        circle: Boolean,
        rounded: {
            type: Boolean,
            default: true
        },
        count: {
            type: Number,
            default: 1
        },
        position: {
            type: String,
            default: '',
            validator(value) {
                return [
                    '',
                    'is-centered',
                    'is-right'
                ].indexOf(value) > -1
            }
        },
        size: String
    },
    render(props) {
        if (!props.active) return
        const items = [];
        const width = props.width;
        const height = props.height;
        for (let i = 0; i < props.count; i++) {
            items.push(h('div', {
                class: [
                    'b-skeleton-item',
                    { 'is-rounded': props.rounded }
                ],
                key: i,
                style: {
                    height: height === undefined
                        ? null
                        : (isNaN(height) ? height : height + 'px'),
                    width: width === undefined
                        ? null
                        : (isNaN(width) ? width : width + 'px'),
                    borderRadius: props.circle ? '50%' : null
                }
            }));
        }
        return h(
            'div',
            {
                class: [
                    'b-skeleton',
                    props.size,
                    props.position,
                    { 'is-animated': props.animated }
                ]
            },
            items
        )
    }
};

script$j.__file = "src/components/skeleton/Skeleton.vue";

var Plugin$q = {
  install: function install(Vue) {
    registerComponent(Vue, script$j);
  }
};
use(Plugin$q);
var Plugin$r = Plugin$q;

var script$i = {
    name: 'BSidebar',
    props: {
        modelValue: Boolean,
        type: [String, Object],
        overlay: Boolean,
        position: {
            type: String,
            default: 'fixed',
            validator: (value) => {
                return [
                    'fixed',
                    'absolute',
                    'static'
                ].indexOf(value) >= 0
            }
        },
        fullheight: Boolean,
        fullwidth: Boolean,
        right: Boolean,
        mobile: {
            type: String
        },
        reduce: Boolean,
        expandOnHover: Boolean,
        expandOnHoverFixed: Boolean,
        delay: {
            type: Number,
            default: () => config.defaultSidebarDelay
        },
        canCancel: {
            type: [Array, Boolean],
            default: () => ['escape', 'outside']
        },
        onCancel: {
            type: Function,
            default: () => {}
        },
        scroll: {
            type: String,
            default: () => {
                return config.defaultModalScroll
                    ? config.defaultModalScroll
                    : 'clip'
            },
            validator: (value) => {
                return [
                    'clip',
                    'keep'
                ].indexOf(value) >= 0
            }
        }
    },
    emits: ['close', 'update:modelValue'],
    data() {
        return {
            isOpen: this.modelValue,
            isDelayOver: false,
            transitionName: null,
            animating: true,
            savedScrollTop: null,
            hasLeaved: false
        }
    },
    computed: {
        rootClasses() {
            return [this.type, {
                'is-fixed': this.isFixed,
                'is-static': this.isStatic,
                'is-absolute': this.isAbsolute,
                'is-fullheight': this.fullheight,
                'is-fullwidth': this.fullwidth,
                'is-right': this.right,
                'is-mini': this.reduce && !this.isDelayOver,
                'is-mini-expand': this.expandOnHover || this.isDelayOver,
                'is-mini-expand-fixed': (this.expandOnHover && this.expandOnHoverFixed) || this.isDelayOver,
                'is-mini-delayed': this.delay !== null,
                'is-mini-mobile': this.mobile === 'reduce',
                'is-hidden-mobile': this.mobile === 'hide',
                'is-fullwidth-mobile': this.mobile === 'fullwidth'
            }]
        },
        cancelOptions() {
            return typeof this.canCancel === 'boolean'
                ? this.canCancel
                    ? ['escape', 'outside']
                    : []
                : this.canCancel
        },
        isStatic() {
            return this.position === 'static'
        },
        isFixed() {
            return this.position === 'fixed'
        },
        isAbsolute() {
            return this.position === 'absolute'
        }
    },
    watch: {
        modelValue: {
            handler(value) {
                this.isOpen = value;
                if (this.overlay) {
                    this.handleScroll();
                }
                const open = this.right ? !value : value;
                this.transitionName = !open ? 'slide-prev' : 'slide-next';
            },
            immediate: true
        }
    },
    methods: {
        /**
        * Keypress event that is bound to the document.
        */
        keyPress({ key }) {
            if (this.isFixed) {
                if (this.isOpen && (key === 'Escape' || key === 'Esc')) this.cancel('escape');
            }
        },

        /**
        * Close the Sidebar if canCancel and call the onCancel prop (function).
        */
        cancel(method) {
            if (this.cancelOptions.indexOf(method) < 0) return
            if (this.isStatic) return

            this.onCancel.apply(null, arguments);
            this.close();
        },

        /**
        * Call the onCancel prop (function) and emit events
        */
        close() {
            this.isOpen = false;
            this.$emit('close');
            this.$emit('update:modelValue', false);
        },

        /**
         * Close fixed sidebar if clicked outside.
         */
        clickedOutside(event) {
            if (!this.isFixed || !this.isOpen || this.animating) { return }

            if (!event.composedPath().includes(this.$refs.sidebarContent)) {
                this.cancel('outside');
            }
        },

        /**
        * Transition before-enter hook
        */
        beforeEnter() {
            this.animating = true;
        },

        /**
        * Transition after-leave hook
        */
        afterEnter() {
            this.animating = false;
        },

        handleScroll() {
            if (typeof window === 'undefined') return

            if (this.scroll === 'clip') {
                if (this.modelValue) {
                    document.documentElement.classList.add('is-clipped');
                } else {
                    document.documentElement.classList.remove('is-clipped');
                }
                return
            }

            this.savedScrollTop = !this.savedScrollTop
                ? document.documentElement.scrollTop
                : this.savedScrollTop;

            if (this.modelValue) {
                document.body.classList.add('is-noscroll');
            } else {
                document.body.classList.remove('is-noscroll');
            }

            if (this.modelValue) {
                document.body.style.top = `-${this.savedScrollTop}px`;
                return
            }

            document.documentElement.scrollTop = this.savedScrollTop;
            document.body.style.top = null;
            this.savedScrollTop = null;
        },
        onHover() {
            if (this.delay) {
                this.hasLeaved = false;
                this.timer = setTimeout(() => {
                    if (!this.hasLeaved) {
                        this.isDelayOver = true;
                    }
                    this.timer = null;
                }, this.delay);
            } else {
                this.isDelayOver = false;
            }
        },
        onHoverLeave() {
            this.hasLeaved = true;
            this.timer = null;
            this.isDelayOver = false;
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keyup', this.keyPress);
            document.addEventListener('click', this.clickedOutside);
        }
    },
    mounted() {
        if (typeof window !== 'undefined') {
            if (this.isFixed) {
                document.body.appendChild(this.$el);
            }
        }
        if (this.overlay && this.modelValue) {
            this.handleScroll();
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keyup', this.keyPress);
            document.removeEventListener('click', this.clickedOutside);
            if (this.overlay) {
                // reset scroll
                document.documentElement.classList.remove('is-clipped');
                const savedScrollTop = !this.savedScrollTop
                    ? document.documentElement.scrollTop
                    : this.savedScrollTop;
                document.body.classList.remove('is-noscroll');
                document.documentElement.scrollTop = savedScrollTop;
                document.body.style.top = null;
            }
        }
        if (this.isFixed) {
            removeElement(this.$el);
        }
    }
};

const _hoisted_1$e = { class: "b-sidebar" };
const _hoisted_2$b = {
  key: 0,
  class: "sidebar-background"
};

function render$f(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$e, [
    ($props.overlay && $data.isOpen)
      ? (openBlock(), createElementBlock("div", _hoisted_2$b))
      : createCommentVNode("v-if", true),
    createVNode(Transition, {
      name: $data.transitionName,
      onBeforeEnter: $options.beforeEnter,
      onAfterEnter: $options.afterEnter,
      persisted: ""
    }, {
      default: withCtx(() => [
        withDirectives(createElementVNode("div", {
          ref: "sidebarContent",
          class: normalizeClass(["sidebar-content", $options.rootClasses]),
          onMouseenter: _cache[0] || (_cache[0] = (...args) => ($options.onHover && $options.onHover(...args))),
          onMouseleave: _cache[1] || (_cache[1] = (...args) => ($options.onHoverLeave && $options.onHoverLeave(...args)))
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 34 /* CLASS, HYDRATE_EVENTS */), [
          [vShow, $data.isOpen]
        ])
      ]),
      _: 3 /* FORWARDED */
    }, 8 /* PROPS */, ["name", "onBeforeEnter", "onAfterEnter"])
  ]))
}

script$i.render = render$f;
script$i.__file = "src/components/sidebar/Sidebar.vue";

var Plugin$o = {
  install: function install(Vue) {
    registerComponent(Vue, script$i);
  }
};
use(Plugin$o);
var Plugin$p = Plugin$o;

var script$h = {
    name: 'BSliderThumb',
    components: {
        [script$N.name]: script$N
    },
    inheritAttrs: false,
    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        type: {
            type: String,
            default: ''
        },
        tooltip: {
            type: Boolean,
            default: true
        },
        indicator: {
            type: Boolean,
            default: false
        },
        customFormatter: Function,
        format: {
            type: String,
            default: 'raw',
            validator: (value) => {
                return [
                    'raw',
                    'percent'
                ].indexOf(value) >= 0
            }
        },
        locale: {
            type: [String, Array],
            default: () => {
                return config.defaultLocale
            }
        },
        tooltipAlways: {
            type: Boolean,
            default: false
        }
    },
    emits: ['dragend', 'dragstart', 'update:modelValue'],
    data() {
        return {
            isFocused: false,
            dragging: false,
            startX: 0,
            startPosition: 0,
            newPosition: null,
            oldValue: this.modelValue
        }
    },
    computed: {
        disabled() {
            return this.$parent.disabled
        },
        max() {
            return this.$parent.max
        },
        min() {
            return this.$parent.min
        },
        step() {
            return this.$parent.step
        },
        precision() {
            return this.$parent.precision
        },
        currentPosition() {
            return `${(this.modelValue - this.min) / (this.max - this.min) * 100}%`
        },
        wrapperStyle() {
            return { left: this.currentPosition }
        },
        formattedValue() {
            if (typeof this.customFormatter !== 'undefined') {
                return this.customFormatter(this.modelValue)
            }

            if (this.format === 'percent') {
                return new Intl.NumberFormat(
                    this.locale,
                    {
                        style: 'percent'
                    }
                ).format(((this.modelValue - this.min)) / (this.max - this.min))
            }

            return new Intl.NumberFormat(this.locale).format(this.modelValue)
        }
    },
    methods: {
        onFocus() {
            this.isFocused = true;
        },
        onBlur() {
            this.isFocused = false;
        },
        onButtonDown(event) {
            if (this.disabled) return
            event.preventDefault();
            this.onDragStart(event);
            if (typeof window !== 'undefined') {
                document.addEventListener('mousemove', this.onDragging);
                document.addEventListener('touchmove', this.onDragging);
                document.addEventListener('mouseup', this.onDragEnd);
                document.addEventListener('touchend', this.onDragEnd);
                document.addEventListener('contextmenu', this.onDragEnd);
            }
        },
        onLeftKeyDown() {
            if (this.disabled || this.modelValue === this.min) return
            this.newPosition = parseFloat(this.currentPosition) -
                this.step / (this.max - this.min) * 100;
            this.setPosition(this.newPosition);
            this.$parent.emitValue('change');
        },
        onRightKeyDown() {
            if (this.disabled || this.modelValue === this.max) return
            this.newPosition = parseFloat(this.currentPosition) +
                this.step / (this.max - this.min) * 100;
            this.setPosition(this.newPosition);
            this.$parent.emitValue('change');
        },
        onHomeKeyDown() {
            if (this.disabled || this.modelValue === this.min) return
            this.newPosition = 0;
            this.setPosition(this.newPosition);
            this.$parent.emitValue('change');
        },
        onEndKeyDown() {
            if (this.disabled || this.modelValue === this.max) return
            this.newPosition = 100;
            this.setPosition(this.newPosition);
            this.$parent.emitValue('change');
        },
        onDragStart(event) {
            this.dragging = true;
            this.$emit('dragstart');
            if (event.type === 'touchstart') {
                event.clientX = event.touches[0].clientX;
            }
            this.startX = event.clientX;
            this.startPosition = parseFloat(this.currentPosition);
            this.newPosition = this.startPosition;
        },
        onDragging(event) {
            if (this.dragging) {
                if (event.type === 'touchmove') {
                    event.clientX = event.touches[0].clientX;
                }
                const diff = (event.clientX - this.startX) / this.$parent.sliderSize() * 100;
                this.newPosition = this.startPosition + diff;
                this.setPosition(this.newPosition);
            }
        },
        onDragEnd() {
            this.dragging = false;
            this.$emit('dragend');
            if (this.modelValue !== this.oldValue) {
                this.$parent.emitValue('change');
            }
            this.setPosition(this.newPosition);
            if (typeof window !== 'undefined') {
                document.removeEventListener('mousemove', this.onDragging);
                document.removeEventListener('touchmove', this.onDragging);
                document.removeEventListener('mouseup', this.onDragEnd);
                document.removeEventListener('touchend', this.onDragEnd);
                document.removeEventListener('contextmenu', this.onDragEnd);
            }
        },
        setPosition(percent) {
            if (percent === null || isNaN(percent)) return
            if (percent < 0) {
                percent = 0;
            } else if (percent > 100) {
                percent = 100;
            }
            const stepLength = 100 / ((this.max - this.min) / this.step);
            const steps = Math.round(percent / stepLength);
            let value = steps * stepLength / 100 * (this.max - this.min) + this.min;
            value = parseFloat(value.toFixed(this.precision));
            this.$emit('update:modelValue', value);
            if (!this.dragging && value !== this.oldValue) {
                this.oldValue = value;
            }
        }
    }
};

const _hoisted_1$d = ["tabindex"];
const _hoisted_2$a = { key: 0 };

function render$e(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_tooltip = resolveComponent("b-tooltip");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["b-slider-thumb-wrapper", { 'is-dragging': $data.dragging, 'has-indicator': $props.indicator}]),
    style: normalizeStyle($options.wrapperStyle)
  }, [
    createVNode(_component_b_tooltip, {
      label: $options.formattedValue,
      type: $props.type,
      always: $data.dragging || $data.isFocused || $props.tooltipAlways,
      active: !$options.disabled && $props.tooltip
    }, {
      default: withCtx(() => [
        createElementVNode("div", mergeProps({
          class: "b-slider-thumb",
          tabindex: $options.disabled ? false : 0
        }, _ctx.$attrs, {
          onMousedown: _cache[0] || (_cache[0] = (...args) => ($options.onButtonDown && $options.onButtonDown(...args))),
          onTouchstart: _cache[1] || (_cache[1] = (...args) => ($options.onButtonDown && $options.onButtonDown(...args))),
          onFocus: _cache[2] || (_cache[2] = (...args) => ($options.onFocus && $options.onFocus(...args))),
          onBlur: _cache[3] || (_cache[3] = (...args) => ($options.onBlur && $options.onBlur(...args))),
          onKeydown: [
            _cache[4] || (_cache[4] = withKeys(withModifiers((...args) => ($options.onLeftKeyDown && $options.onLeftKeyDown(...args)), ["prevent"]), ["left"])),
            _cache[5] || (_cache[5] = withKeys(withModifiers((...args) => ($options.onRightKeyDown && $options.onRightKeyDown(...args)), ["prevent"]), ["right"])),
            _cache[6] || (_cache[6] = withKeys(withModifiers((...args) => ($options.onLeftKeyDown && $options.onLeftKeyDown(...args)), ["prevent"]), ["down"])),
            _cache[7] || (_cache[7] = withKeys(withModifiers((...args) => ($options.onRightKeyDown && $options.onRightKeyDown(...args)), ["prevent"]), ["up"])),
            _cache[8] || (_cache[8] = withKeys(withModifiers((...args) => ($options.onHomeKeyDown && $options.onHomeKeyDown(...args)), ["prevent"]), ["home"])),
            _cache[9] || (_cache[9] = withKeys(withModifiers((...args) => ($options.onEndKeyDown && $options.onEndKeyDown(...args)), ["prevent"]), ["end"]))
          ]
        }), [
          ($props.indicator)
            ? (openBlock(), createElementBlock("span", _hoisted_2$a, toDisplayString($options.formattedValue), 1 /* TEXT */))
            : createCommentVNode("v-if", true)
        ], 16 /* FULL_PROPS */, _hoisted_1$d)
      ]),
      _: 1 /* STABLE */
    }, 8 /* PROPS */, ["label", "type", "always", "active"])
  ], 6 /* CLASS, STYLE */))
}

script$h.render = render$e;
script$h.__file = "src/components/slider/SliderThumb.vue";

var script$g = {
    name: 'BSliderTick',
    props: {
        value: {
            type: Number,
            default: 0
        }
    },
    computed: {
        position() {
            const pos = (this.value - this.$parent.min) /
                (this.$parent.max - this.$parent.min) * 100;
            return (pos >= 0 && pos <= 100) ? pos : 0
        },
        hidden() {
            return this.value === this.$parent.min || this.value === this.$parent.max
        }
    },
    methods: {
        getTickStyle(position) {
            return { left: position + '%' }
        }
    },
    created() {
        if (!this.$parent.$data._isSlider) {
            throw new Error('You should wrap bSliderTick on a bSlider')
        }
    }
};

const _hoisted_1$c = {
  key: 0,
  class: "b-slider-tick-label"
};

function render$d(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["b-slider-tick", { 'is-tick-hidden': $options.hidden }]),
    style: normalizeStyle($options.getTickStyle($options.position))
  }, [
    (_ctx.$slots.default)
      ? (openBlock(), createElementBlock("span", _hoisted_1$c, [
          renderSlot(_ctx.$slots, "default")
        ]))
      : createCommentVNode("v-if", true)
  ], 6 /* CLASS, STYLE */))
}

script$g.render = render$d;
script$g.__file = "src/components/slider/SliderTick.vue";

var script$f = {
    name: 'BSlider',
    components: {
        [script$h.name]: script$h,
        [script$g.name]: script$g
    },
    props: {
        modelValue: {
            type: [Number, Array],
            default: 0
        },
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 100
        },
        step: {
            type: Number,
            default: 1
        },
        type: {
            type: String,
            default: 'is-primary'
        },
        size: String,
        ticks: {
            type: Boolean,
            default: false
        },
        tooltip: {
            type: Boolean,
            default: true
        },
        tooltipType: String,
        rounded: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        lazy: {
            type: Boolean,
            default: false
        },
        customFormatter: Function,
        ariaLabel: [String, Array],
        biggerSliderFocus: {
            type: Boolean,
            default: false
        },
        indicator: {
            type: Boolean,
            default: false
        },
        format: {
            type: String,
            default: 'raw',
            validator: (value) => {
                return [
                    'raw',
                    'percent'
                ].indexOf(value) >= 0
            }
        },
        locale: {
            type: [String, Array],
            default: () => {
                return config.defaultLocale
            }
        },
        tooltipAlways: {
            type: Boolean,
            default: false
        }
    },
    emits: ['change', 'dragend', 'dragging', 'dragstart', 'update:modelValue'],
    data() {
        return {
            value1: null,
            value2: null,
            // internal is used to update value1 and value2 with a single shot.
            // internal is also used to stop unnecessary propagation of update.
            internal: {
                value1: null,
                value2: null
            },
            dragging: false,
            isRange: false,
            _isSlider: true // Used by Thumb and Tick
        }
    },
    computed: {
        newTooltipType() {
            return this.tooltipType ? this.tooltipType : this.type
        },
        tickValues() {
            if (!this.ticks || this.min > this.max || this.step === 0) return []
            const result = [];
            for (let i = this.min + this.step; i < this.max; i = i + this.step) {
                result.push(i);
            }
            return result
        },
        minValue() {
            return Math.min(this.value1, this.value2)
        },
        maxValue() {
            return Math.max(this.value1, this.value2)
        },
        barSize() {
            return this.isRange
                ? `${100 * (this.maxValue - this.minValue) / (this.max - this.min)}%`
                : `${100 * (this.value1 - this.min) / (this.max - this.min)}%`
        },
        barStart() {
            return this.isRange
                ? `${100 * (this.minValue - this.min) / (this.max - this.min)}%`
                : '0%'
        },
        precision() {
            const precisions = [this.min, this.max, this.step].map((item) => {
                const decimal = ('' + item).split('.')[1];
                return decimal ? decimal.length : 0
            });
            return Math.max(...precisions)
        },
        barStyle() {
            return {
                width: this.barSize,
                left: this.barStart
            }
        },
        rootClasses() {
            return {
                'is-rounded': this.rounded,
                'is-dragging': this.dragging,
                'is-disabled': this.disabled,
                'slider-focus': this.biggerSliderFocus
            }
        }
    },
    watch: {
        /**
        * When v-model is changed set the new active step.
        */
        modelValue(value) {
            this.setValues(value);
        },
        internal({ value1, value2 }) {
            this.value1 = value1;
            this.value2 = value2;
        },
        value1(newValue) {
            if (this.internal.value1 !== newValue) {
                this.onInternalValueUpdate();
            }
        },
        value2(newValue) {
            if (this.internal.value2 !== newValue) {
                this.onInternalValueUpdate();
            }
        },
        min() {
            this.setValues(this.modelValue);
        },
        max() {
            this.setValues(this.modelValue);
        }
    },
    methods: {
        setValues(newValue) {
            if (this.min > this.max) {
                return
            }
            if (Array.isArray(newValue)) {
                this.isRange = true;
                const smallValue = typeof newValue[0] !== 'number' || isNaN(newValue[0])
                    ? this.min
                    : bound(newValue[0], this.min, this.max);
                const largeValue = typeof newValue[1] !== 'number' || isNaN(newValue[1])
                    ? this.max
                    : bound(newValue[1], this.min, this.max);
                // premature update will be triggered and end up with circular
                // update, if value1 and value2 are updated one by one
                this.internal = {
                    value1: this.isThumbReversed ? largeValue : smallValue,
                    value2: this.isThumbReversed ? smallValue : largeValue
                };
            } else {
                this.isRange = false;
                this.internal = {
                    value1: isNaN(newValue)
                        ? this.min
                        : bound(newValue, this.min, this.max),
                    value2: null
                };
            }
        },
        onInternalValueUpdate() {
            if (this.isRange) {
                this.isThumbReversed = this.value1 > this.value2;
            }
            if (!this.lazy || !this.dragging) {
                this.emitValue('update:modelValue');
            }
            if (this.dragging) {
                this.emitValue('dragging');
            }
        },
        sliderSize() {
            return this.$refs.slider.getBoundingClientRect().width
        },
        onSliderClick(event) {
            if (this.disabled || this.isTrackClickDisabled) return
            const sliderOffsetLeft = this.$refs.slider.getBoundingClientRect().left;
            const percent = (event.clientX - sliderOffsetLeft) / this.sliderSize() * 100;
            const targetValue = this.min + percent * (this.max - this.min) / 100;
            const diffFirst = Math.abs(targetValue - this.value1);
            if (!this.isRange) {
                if (diffFirst < this.step / 2) return
                this.$refs.button1.setPosition(percent);
            } else {
                const diffSecond = Math.abs(targetValue - this.value2);
                if (diffFirst <= diffSecond) {
                    if (diffFirst < this.step / 2) return
                    this.$refs.button1.setPosition(percent);
                } else {
                    if (diffSecond < this.step / 2) return
                    this.$refs.button2.setPosition(percent);
                }
            }
            this.emitValue('change');
        },
        onDragStart() {
            this.dragging = true;
            this.$emit('dragstart');
        },
        onDragEnd() {
            this.isTrackClickDisabled = true;
            setTimeout(() => {
                // avoid triggering onSliderClick after dragend
                this.isTrackClickDisabled = false;
            }, 0);
            this.dragging = false;
            this.$emit('dragend');
            if (this.lazy) {
                this.emitValue('update:modelValue');
            }
        },
        emitValue(type) {
            this.$emit(type, this.isRange
                ? [this.minValue, this.maxValue]
                : this.value1);
        }
    },
    created() {
        this.isThumbReversed = false;
        this.isTrackClickDisabled = false;
        this.setValues(this.modelValue);
    }
};

const _hoisted_1$b = {
  class: "b-slider-track",
  ref: "slider"
};

function render$c(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_slider_tick = resolveComponent("b-slider-tick");
  const _component_b_slider_thumb = resolveComponent("b-slider-thumb");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["b-slider", [$props.size, $props.type, $options.rootClasses ]]),
    onClick: _cache[2] || (_cache[2] = (...args) => ($options.onSliderClick && $options.onSliderClick(...args)))
  }, [
    createElementVNode("div", _hoisted_1$b, [
      createElementVNode("div", {
        class: "b-slider-fill",
        style: normalizeStyle($options.barStyle)
      }, null, 4 /* STYLE */),
      ($props.ticks)
        ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList($options.tickValues, (val, key) => {
            return (openBlock(), createBlock(_component_b_slider_tick, {
              key: key,
              value: val
            }, null, 8 /* PROPS */, ["value"]))
          }), 128 /* KEYED_FRAGMENT */))
        : createCommentVNode("v-if", true),
      renderSlot(_ctx.$slots, "default"),
      createVNode(_component_b_slider_thumb, {
        "tooltip-always": $props.tooltipAlways,
        modelValue: $data.value1,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($data.value1) = $event)),
        type: $options.newTooltipType,
        tooltip: $props.tooltip,
        "custom-formatter": $props.customFormatter,
        indicator: $props.indicator,
        format: $props.format,
        locale: $props.locale,
        ref: "button1",
        role: "slider",
        "aria-valuenow": $data.value1,
        "aria-valuemin": $props.min,
        "aria-valuemax": $props.max,
        "aria-orientation": "horizontal",
        "aria-label": Array.isArray($props.ariaLabel) ? $props.ariaLabel[0] : $props.ariaLabel,
        "aria-disabled": $props.disabled,
        onDragstart: $options.onDragStart,
        onDragend: $options.onDragEnd
      }, null, 8 /* PROPS */, ["tooltip-always", "modelValue", "type", "tooltip", "custom-formatter", "indicator", "format", "locale", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-label", "aria-disabled", "onDragstart", "onDragend"]),
      ($data.isRange)
        ? (openBlock(), createBlock(_component_b_slider_thumb, {
            key: 1,
            "tooltip-always": $props.tooltipAlways,
            modelValue: $data.value2,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($data.value2) = $event)),
            type: $options.newTooltipType,
            tooltip: $props.tooltip,
            "custom-formatter": $props.customFormatter,
            indicator: $props.indicator,
            format: $props.format,
            locale: $props.locale,
            ref: "button2",
            role: "slider",
            "aria-valuenow": $data.value2,
            "aria-valuemin": $props.min,
            "aria-valuemax": $props.max,
            "aria-orientation": "horizontal",
            "aria-label": Array.isArray($props.ariaLabel) ? $props.ariaLabel[1] : '',
            "aria-disabled": $props.disabled,
            onDragstart: $options.onDragStart,
            onDragend: $options.onDragEnd
          }, null, 8 /* PROPS */, ["tooltip-always", "modelValue", "type", "tooltip", "custom-formatter", "indicator", "format", "locale", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-label", "aria-disabled", "onDragstart", "onDragend"]))
        : createCommentVNode("v-if", true)
    ], 512 /* NEED_PATCH */)
  ], 2 /* CLASS */))
}

script$f.render = render$c;
script$f.__file = "src/components/slider/Slider.vue";

var Plugin$m = {
  install: function install(Vue) {
    registerComponent(Vue, script$f);
    registerComponent(Vue, script$g);
  }
};
use(Plugin$m);
var Plugin$n = Plugin$m;

var script$e = {
    name: 'BSnackbar',
    mixins: [NoticeMixin],
    props: {
        actionText: {
            type: String,
            default: 'OK'
        },
        onAction: {
            type: Function,
            default: () => {}
        },
        cancelText: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            newDuration: this.duration || config.defaultSnackbarDuration
        }
    },
    methods: {
        /**
        * Click listener.
        * Call action prop before closing (from Mixin).
        */
        action() {
            this.onAction();
            this.close();
        }
    }
};

const _hoisted_1$a = ["role"];
const _hoisted_2$9 = ["innerHTML"];
const _hoisted_3$7 = { class: "button" };
const _hoisted_4$4 = { class: "button" };

function render$b(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, {
    "enter-active-class": _ctx.transition.enter,
    "leave-active-class": _ctx.transition.leave,
    persisted: ""
  }, {
    default: withCtx(() => [
      withDirectives(createElementVNode("div", {
        class: normalizeClass(["snackbar", [_ctx.type,_ctx.position]]),
        onMouseenter: _cache[2] || (_cache[2] = (...args) => (_ctx.pause && _ctx.pause(...args))),
        onMouseleave: _cache[3] || (_cache[3] = (...args) => (_ctx.removePause && _ctx.removePause(...args))),
        role: $props.actionText ? 'alertdialog' : 'alert'
      }, [
        (_ctx.$slots.default)
          ? renderSlot(_ctx.$slots, "default", { key: 0 })
          : (openBlock(), createElementBlock("div", {
              key: 1,
              class: "text",
              innerHTML: _ctx.message
            }, null, 8 /* PROPS */, _hoisted_2$9)),
        ($props.cancelText)
          ? (openBlock(), createElementBlock("div", {
              key: 2,
              class: "action is-light is-cancel",
              onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.close && _ctx.close(...args)))
            }, [
              createElementVNode("button", _hoisted_3$7, toDisplayString($props.cancelText), 1 /* TEXT */)
            ]))
          : createCommentVNode("v-if", true),
        ($props.actionText)
          ? (openBlock(), createElementBlock("div", {
              key: 3,
              class: normalizeClass(["action", _ctx.type]),
              onClick: _cache[1] || (_cache[1] = (...args) => ($options.action && $options.action(...args)))
            }, [
              createElementVNode("button", _hoisted_4$4, toDisplayString($props.actionText), 1 /* TEXT */)
            ], 2 /* CLASS */))
          : createCommentVNode("v-if", true)
      ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$a), [
        [vShow, _ctx.isActive]
      ])
    ]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["enter-active-class", "leave-active-class"]))
}

script$e.render = render$b;
script$e.__file = "src/components/snackbar/Snackbar.vue";

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$2(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var SnackbarProgrammatic = {
  open: function open(params) {
    if (typeof params === 'string') {
      params = {
        message: params
      };
    }
    var defaultParam = {
      type: 'is-success',
      position: config.defaultSnackbarPosition || 'is-bottom-right',
      queue: true
    };
    if (params.parent) {
      delete params.parent;
    }
    var slot;
    if (Array.isArray(params.message)) {
      slot = params.message;
      delete params.message;
    }
    var propsData = merge(defaultParam, params);
    var container = document.createElement('div');
    var vueInstance = createApp({
      data: function data() {
        return {
          snackbarVNode: null
        };
      },
      methods: {
        close: function close() {
          var snackbar = getComponentFromVNode(this.snackbarVNode);
          if (snackbar) {
            snackbar.close();
          }
        }
      },
      render: function render() {
        this.snackbarVNode = h(script$e, _objectSpread$2(_objectSpread$2({}, propsData), {}, {
          onClose: function onClose() {
            if (typeof propsData.onClose === 'function') {
              propsData.onClose();
            }
            // timeout for the animation complete
            // before unmounting
            setTimeout(function () {
              vueInstance.unmount();
            }, 150);
          }
        }), slot != null ? {
          default: function _default() {
            return slot;
          }
        } : undefined);
        return this.snackbarVNode;
      }
    });
    // adds $buefy global property so that
    // this.$buefy.globalNoticeInterval is available
    vueInstance.config.globalProperties.$buefy = {};
    return vueInstance.mount(container);
  }
};
var Plugin$k = {
  install: function install(Vue) {
    registerComponentProgrammatic(Vue, 'snackbar', SnackbarProgrammatic);
  }
};
use(Plugin$k);
var Plugin$l = Plugin$k;

var SlotComponent = {
  name: 'BSlotComponent',
  props: {
    component: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      default: 'default'
    },
    scoped: {
      type: Boolean
    },
    props: {
      type: Object
    },
    tag: {
      type: String,
      default: 'div'
    },
    event: {
      type: String,
      default: 'hook:updated'
    }
  },
  methods: {
    refresh: function refresh() {
      this.$forceUpdate();
    }
  },
  created: function created() {
    if (isVueComponent(this.component)) {
      this.component.$on(this.event, this.refresh);
    }
  },
  beforeUnmount: function beforeUnmount() {
    if (isVueComponent(this.component)) {
      this.component.$off(this.event, this.refresh);
    }
  },
  render: function render() {
    return h(this.tag, {}, this.scoped ? this.component.$slots[this.name](this.props) : this.component.$slots[this.name]());
  }
};

var TabbedMixin = (function (cmp) {
  var _components;
  return {
    mixins: [ProviderParentMixin(cmp, Sorted$1)],
    components: (_components = {}, _defineProperty(_components, script$17.name, script$17), _defineProperty(_components, SlotComponent.name, SlotComponent), _components),
    props: {
      modelValue: {
        type: [String, Number],
        default: undefined
      },
      size: String,
      animated: {
        type: Boolean,
        default: true
      },
      animation: String,
      animateInitially: Boolean,
      vertical: {
        type: Boolean,
        default: false
      },
      position: String,
      destroyOnHide: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:modelValue'],
    data: function data() {
      return {
        activeId: this.modelValue,
        // Internal state
        defaultSlots: [],
        contentHeight: 0,
        isTransitioning: false
      };
    },
    mounted: function mounted() {
      if (typeof this.modelValue === 'number') {
        // Backward compatibility: converts the index value to an id
        var value = bound(this.modelValue, 0, this.items.length - 1);
        this.activeId = this.items[value].value;
      } else {
        this.activeId = this.modelValue;
      }
    },
    computed: {
      activeItem: function activeItem() {
        var _this = this;
        return this.activeId === undefined ? this.items[0] : this.activeId === null ? null : this.childItems.find(function (i) {
          return i.value === _this.activeId;
        });
      },
      items: function items() {
        return this.sortedItems;
      }
    },
    watch: {
      /**
       * When v-model is changed set the new active tab.
       */
      modelValue: function modelValue(value) {
        if (typeof value === 'number') {
          // Backward compatibility: converts the index value to an id
          value = bound(value, 0, this.items.length - 1);
          this.activeId = this.items[value].value;
        } else {
          this.activeId = value;
        }
      },
      /**
       * Sync internal state with external state
       */
      activeId: function activeId(val, oldValue) {
        var oldTab = oldValue !== undefined && oldValue !== null ? this.childItems.find(function (i) {
          return i.value === oldValue;
        }) : null;
        if (oldTab && this.activeItem) {
          oldTab.deactivate(this.activeItem.index);
          this.activeItem.activate(oldTab.index);
        }
        val = this.activeItem ? typeof this.modelValue === 'number' ? this.items.indexOf(this.activeItem) : this.activeItem.value : undefined;
        if (val !== this.modelValue) {
          this.$emit('update:modelValue', val);
        }
      }
    },
    methods: {
      /**
      * Child click listener, emit input event and change active child.
      */
      childClick: function childClick(child) {
        this.activeId = child.value;
      },
      getNextItemIdx: function getNextItemIdx(fromIdx) {
        var skipDisabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var nextItemIdx = null;
        for (var i = 0; i < this.items.length; i++) {
          var item = this.items[i];
          if (fromIdx < item.index && item.visible && (!skipDisabled || skipDisabled && !item.disabled)) {
            nextItemIdx = item.index;
            break;
          }
        }
        return nextItemIdx;
      },
      getPrevItemIdx: function getPrevItemIdx(fromIdx) {
        var skipDisabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var prevItemIdx = null;
        for (var i = this.items.length - 1; i >= 0; i--) {
          var item = this.items[i];
          if (item.index < fromIdx && item.visible && (!skipDisabled || skipDisabled && !item.disabled)) {
            prevItemIdx = item.index;
            break;
          }
        }
        return prevItemIdx;
      }
    }
  };
});

var script$d = {
    name: 'BSteps',
    components: {
        [script$17.name]: script$17
    },
    mixins: [TabbedMixin('step')],
    props: {
        type: [String, Object],
        iconPack: String,
        iconPrev: {
            type: String,
            default: () => {
                return config.defaultIconPrev
            }
        },
        iconNext: {
            type: String,
            default: () => {
                return config.defaultIconNext
            }
        },
        hasNavigation: {
            type: Boolean,
            default: true
        },
        labelPosition: {
            type: String,
            validator(value) {
                return [
                    'bottom',
                    'right',
                    'left'
                ].indexOf(value) > -1
            },
            default: 'bottom'
        },
        rounded: {
            type: Boolean,
            default: true
        },
        mobileMode: {
            type: String,
            validator(value) {
                return [
                    'minimalist',
                    'compact'
                ].indexOf(value) > -1
            },
            default: 'minimalist'
        },
        ariaNextLabel: String,
        ariaPreviousLabel: String
    },
    computed: {
        // Override mixin implementation to always have a value
        activeItem() {
            return this.childItems.filter((i) => i.value === this.activeId)[0] || this.items[0]
        },
        wrapperClasses() {
            return [
                this.size,
                {
                    'is-vertical': this.vertical,
                    [this.position]: this.position && this.vertical
                }
            ]
        },
        mainClasses() {
            return [
                this.type,
                {
                    'has-label-right': this.labelPosition === 'right',
                    'has-label-left': this.labelPosition === 'left',
                    'is-animated': this.animated,
                    'is-rounded': this.rounded,
                    [`mobile-${this.mobileMode}`]: this.mobileMode !== null
                }
            ]
        },

        /**
         * Check if previous button is available.
         */
        hasPrev() {
            return this.prevItemIdx !== null
        },

        /**
         * Retrieves the next visible item index
         */
        nextItemIdx() {
            const idx = this.activeItem ? this.activeItem.index : 0;
            return this.getNextItemIdx(idx)
        },

        /**
         * Retrieves the next visible item
         */
        nextItem() {
            let nextItem = null;
            if (this.nextItemIdx !== null) {
                nextItem = this.items.find((i) => i.index === this.nextItemIdx);
            }
            return nextItem
        },

        /**
        * Retrieves the next visible item index
        */
        prevItemIdx() {
            if (!this.activeItem) { return null }
            const idx = this.activeItem.index;
            return this.getPrevItemIdx(idx)
        },

        /**
         * Retrieves the previous visible item
         */
        prevItem() {
            if (!this.activeItem) { return null }

            let prevItem = null;
            if (this.prevItemIdx !== null) {
                prevItem = this.items.find((i) => i.index === this.prevItemIdx);
            }
            return prevItem
        },

        /**
         * Check if next button is available.
         */
        hasNext() {
            return this.nextItemIdx !== null
        },

        navigationProps() {
            return {
                previous: {
                    disabled: !this.hasPrev,
                    action: this.prev
                },
                next: {
                    disabled: !this.hasNext,
                    action: this.next
                }
            }
        }
    },
    methods: {
        /**
         * Return if the step should be clickable or not.
         */
        isItemClickable(stepItem) {
            if (stepItem.clickable === undefined) {
                return stepItem.index < this.activeItem.index
            }
            return stepItem.clickable
        },

        /**
         * Previous button click listener.
         */
        prev() {
            if (this.hasPrev) {
                this.activeId = this.prevItem.value;
            }
        },

        /**
         * Previous button click listener.
         */
        next() {
            if (this.hasNext) {
                this.activeId = this.nextItem.value;
            }
        }
    }
};

const _hoisted_1$9 = { class: "step-items" };
const _hoisted_2$8 = ["onClick"];
const _hoisted_3$6 = { class: "step-marker" };
const _hoisted_4$3 = { key: 1 };
const _hoisted_5$2 = { class: "step-details" };
const _hoisted_6$1 = { class: "step-title" };
const _hoisted_7$1 = {
  key: 0,
  class: "step-navigation"
};
const _hoisted_8$1 = ["disabled", "aria-label"];
const _hoisted_9$1 = ["disabled", "aria-label"];

function render$a(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["b-steps", $options.wrapperClasses])
  }, [
    createElementVNode("nav", {
      class: normalizeClass(["steps", $options.mainClasses])
    }, [
      createElementVNode("ul", _hoisted_1$9, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.items, (childItem) => {
          return withDirectives((openBlock(), createElementBlock("li", {
            key: childItem.value,
            class: normalizeClass(["step-item", [childItem.type || $props.type, childItem.headerClass, {
                        'is-active': childItem.isActive,
                        'is-previous': $options.activeItem.index > childItem.index
                    }]])
          }, [
            createElementVNode("a", {
              class: normalizeClass(["step-link", {'is-clickable': $options.isItemClickable(childItem)}]),
              onClick: $event => ($options.isItemClickable(childItem) && _ctx.childClick(childItem))
            }, [
              createElementVNode("div", _hoisted_3$6, [
                (childItem.icon)
                  ? (openBlock(), createBlock(_component_b_icon, {
                      key: 0,
                      icon: childItem.icon,
                      pack: childItem.iconPack,
                      size: _ctx.size
                    }, null, 8 /* PROPS */, ["icon", "pack", "size"]))
                  : (childItem.step)
                    ? (openBlock(), createElementBlock("span", _hoisted_4$3, toDisplayString(childItem.step), 1 /* TEXT */))
                    : createCommentVNode("v-if", true)
              ]),
              createElementVNode("div", _hoisted_5$2, [
                createElementVNode("span", _hoisted_6$1, toDisplayString(childItem.label), 1 /* TEXT */)
              ])
            ], 10 /* CLASS, PROPS */, _hoisted_2$8)
          ], 2 /* CLASS */)), [
            [vShow, childItem.visible]
          ])
        }), 128 /* KEYED_FRAGMENT */))
      ])
    ], 2 /* CLASS */),
    createElementVNode("section", {
      class: normalizeClass(["step-content", {'is-transitioning': _ctx.isTransitioning}])
    }, [
      renderSlot(_ctx.$slots, "default")
    ], 2 /* CLASS */),
    renderSlot(_ctx.$slots, "navigation", {
      previous: $options.navigationProps.previous,
      next: $options.navigationProps.next
    }, () => [
      ($props.hasNavigation)
        ? (openBlock(), createElementBlock("nav", _hoisted_7$1, [
            createElementVNode("a", {
              role: "button",
              class: "pagination-previous",
              disabled: $options.navigationProps.previous.disabled || undefined,
              onClick: _cache[0] || (_cache[0] = withModifiers((...args) => ($options.navigationProps.previous.action && $options.navigationProps.previous.action(...args)), ["prevent"])),
              "aria-label": $props.ariaPreviousLabel
            }, [
              createVNode(_component_b_icon, {
                icon: $props.iconPrev,
                pack: $props.iconPack,
                both: "",
                "aria-hidden": "true"
              }, null, 8 /* PROPS */, ["icon", "pack"])
            ], 8 /* PROPS */, _hoisted_8$1),
            createElementVNode("a", {
              role: "button",
              class: "pagination-next",
              disabled: $options.navigationProps.next.disabled || undefined,
              onClick: _cache[1] || (_cache[1] = withModifiers((...args) => ($options.navigationProps.next.action && $options.navigationProps.next.action(...args)), ["prevent"])),
              "aria-label": $props.ariaNextLabel
            }, [
              createVNode(_component_b_icon, {
                icon: $props.iconNext,
                pack: $props.iconPack,
                both: "",
                "aria-hidden": "true"
              }, null, 8 /* PROPS */, ["icon", "pack"])
            ], 8 /* PROPS */, _hoisted_9$1)
          ]))
        : createCommentVNode("v-if", true)
    ])
  ], 2 /* CLASS */))
}

script$d.render = render$a;
script$d.__file = "src/components/steps/Steps.vue";

function makeUniqueId() {
  var values = new Uint8Array(12);
  window.crypto.getRandomValues(values);
  return Array.prototype.map.call(values, function (v) {
    return v.toString(16);
  }).join('');
}

var TabbedChildMixin = (function (parentCmp) {
  return {
    mixins: [InjectedChildMixin(parentCmp, Sorted)],
    props: {
      label: String,
      icon: String,
      iconPack: String,
      visible: {
        type: Boolean,
        default: true
      },
      value: {
        type: String,
        default: function _default() {
          return makeUniqueId();
        }
      },
      headerClass: {
        type: [String, Array, Object],
        default: null
      }
    },
    data: function data() {
      return {
        transitionName: null,
        elementClass: 'item',
        elementRole: null
      };
    },
    computed: {
      isActive: function isActive() {
        return this.parent.activeItem === this;
      }
    },
    methods: {
      /**
       * Activate element, alter animation name based on the index.
       */
      activate: function activate(oldIndex) {
        this.transitionName = this.index < oldIndex ? this.parent.vertical ? 'slide-down' : 'slide-next' : this.parent.vertical ? 'slide-up' : 'slide-prev';
      },
      /**
       * Deactivate element, alter animation name based on the index.
       */
      deactivate: function deactivate(newIndex) {
        this.transitionName = newIndex < this.index ? this.parent.vertical ? 'slide-down' : 'slide-next' : this.parent.vertical ? 'slide-up' : 'slide-prev';
      }
    },
    render: function render() {
      var _this = this;
      // if destroy apply v-if
      if (this.parent.destroyOnHide) {
        if (!this.isActive || !this.visible) {
          return;
        }
      }
      var vnode = withDirectives(h('div', {
        // NOTE: possible regression of #3272
        // https://github.com/buefy/buefy/issues/3272
        class: this.elementClass,
        role: this.elementRole,
        id: "".concat(this.value, "-content"),
        'aria-labelledby': this.elementRole ? "".concat(this.value, "-label") : null,
        tabindex: this.isActive ? 0 : -1
      }, this.$slots), [[vShow, this.isActive && this.visible]]);
      // check animated prop
      if (this.parent.animated) {
        return h(Transition, {
          name: this.parent.animation || this.transitionName,
          appear: this.parent.animateInitially === true || undefined,
          onBeforeEnter: function onBeforeEnter() {
            _this.parent.isTransitioning = true;
          },
          onAfterEnter: function onAfterEnter() {
            _this.parent.isTransitioning = false;
          }
        }, {
          default: function _default() {
            return vnode;
          }
        });
      }
      return vnode;
    }
  };
});

var script$c = {
    name: 'BStepItem',
    mixins: [TabbedChildMixin('step')],
    props: {
        step: [String, Number],
        type: [String, Object],
        clickable: {
            type: Boolean,
            default: undefined
        }
    },
    data() {
        return {
            elementClass: 'step-item'
        }
    }
};

script$c.__file = "src/components/steps/StepItem.vue";

var Plugin$i = {
  install: function install(Vue) {
    registerComponent(Vue, script$d);
    registerComponent(Vue, script$c);
  }
};
use(Plugin$i);
var Plugin$j = Plugin$i;

var script$b = {
    name: 'BSwitch',
    props: {
        modelValue: [String, Number, Boolean, Function, Object, Array, Date],
        nativeValue: [String, Number, Boolean, Function, Object, Array, Date],
        disabled: Boolean,
        type: String,
        passiveType: String,
        name: String,
        required: Boolean,
        size: String,
        ariaLabelledby: String,
        trueValue: {
            type: [String, Number, Boolean, Function, Object, Array, Date],
            default: true
        },
        falseValue: {
            type: [String, Number, Boolean, Function, Object, Array, Date],
            default: false
        },
        rounded: {
            type: Boolean,
            default: () => {
                return config.defaultSwitchRounded
            }
        },
        outlined: {
            type: Boolean,
            default: false
        },
        leftLabel: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            newValue: this.modelValue,
            isMouseDown: false
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.newValue
            },
            set(value) {
                this.newValue = value;
                this.$emit('update:modelValue', value);
            }
        },
        newClass() {
            return [
                this.size,
                {
                    'is-disabled': this.disabled,
                    'is-rounded': this.rounded,
                    'is-outlined': this.outlined,
                    'has-left-label': this.leftLabel
                }
            ]
        },
        checkClasses() {
            return [
                { 'is-elastic': this.isMouseDown && !this.disabled },
                (this.passiveType && `${this.passiveType}-passive`),
                this.type
            ]
        },
        showControlLabel() {
            return !!this.$slots.default
        },
        disabledOrUndefined() {
            // On Vue 3, setting boolean attribute `false` does not remove it.
            // To do so, `null` or `undefined` has to be specified instead.
            // Setting `disabled="false"` ends up with a grayed out switch.
            return this.disabled || undefined
        }
    },
    watch: {
        /**
        * When v-model change, set internal value.
        */
        modelValue(value) {
            this.newValue = value;
        }
    },
    methods: {
        focus() {
            // MacOS FireFox and Safari do not focus when clicked
            this.$refs.input.focus();
        }
    }
};

const _hoisted_1$8 = ["disabled"];
const _hoisted_2$7 = ["disabled", "name", "required", "value", "true-value", "false-value", "aria-labelledby"];
const _hoisted_3$5 = ["id"];

function render$9(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("label", {
    class: normalizeClass(["switch", $options.newClass]),
    ref: "label",
    disabled: $options.disabledOrUndefined,
    onClick: _cache[2] || (_cache[2] = (...args) => ($options.focus && $options.focus(...args))),
    onKeydown: _cache[3] || (_cache[3] = withKeys(withModifiers($event => (_ctx.$refs.label.click()), ["prevent"]), ["enter"])),
    onMousedown: _cache[4] || (_cache[4] = $event => ($data.isMouseDown = true)),
    onMouseup: _cache[5] || (_cache[5] = $event => ($data.isMouseDown = false)),
    onMouseout: _cache[6] || (_cache[6] = $event => ($data.isMouseDown = false)),
    onBlur: _cache[7] || (_cache[7] = $event => ($data.isMouseDown = false))
  }, [
    withDirectives(createElementVNode("input", {
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($options.computedValue) = $event)),
      type: "checkbox",
      ref: "input",
      onClick: _cache[1] || (_cache[1] = withModifiers(() => {}, ["stop"])),
      disabled: $options.disabledOrUndefined,
      name: $props.name,
      required: $props.required,
      value: $props.nativeValue,
      "true-value": $props.trueValue,
      "false-value": $props.falseValue,
      "aria-labelledby": $props.ariaLabelledby
    }, null, 8 /* PROPS */, _hoisted_2$7), [
      [vModelCheckbox, $options.computedValue]
    ]),
    createElementVNode("span", {
      class: normalizeClass(["check", $options.checkClasses])
    }, null, 2 /* CLASS */),
    ($options.showControlLabel)
      ? (openBlock(), createElementBlock("span", {
          key: 0,
          id: $props.ariaLabelledby,
          class: "control-label"
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 8 /* PROPS */, _hoisted_3$5))
      : createCommentVNode("v-if", true)
  ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$8))
}

script$b.render = render$9;
script$b.__file = "src/components/switch/Switch.vue";

var Plugin$g = {
  install: function install(Vue) {
    registerComponent(Vue, script$b);
  }
};
use(Plugin$g);
var Plugin$h = Plugin$g;

var script$a = {
    name: 'BTableMobileSort',
    components: {
        [script$Q.name]: script$Q,
        [script$17.name]: script$17
    },
    props: {
        currentSortColumn: Object,
        sortMultipleData: Array,
        isAsc: Boolean,
        columns: Array,
        placeholder: String,
        iconPack: String,
        sortIcon: {
            type: String,
            default: 'arrow-up'
        },
        sortIconSize: {
            type: String,
            default: 'is-small'
        },
        sortMultiple: {
            type: Boolean,
            default: false
        }
    },
    emits: ['removePriority', 'sort'],
    data() {
        return {
            sortMultipleSelect: '',
            sortMultipleSelectIndex: -1,
            mobileSort: this.currentSortColumn,
            mobileSortIndex: this.columns.indexOf(this.currentSortColumn),
            defaultEvent: {
                shiftKey: true,
                altKey: true,
                ctrlKey: true
            },
            ignoreSort: false
        }
    },
    computed: {
        showPlaceholder() {
            return !this.columns || !this.columns.some((column) => column === this.mobileSort)
        },
        sortableColumns() {
            return this.columns && this.columns.filter((column) => column.sortable)
        }
    },
    watch: {
        sortMultipleSelect(column) {
            if (this.ignoreSort) {
                this.ignoreSort = false;
            } else {
                this.$emit('sort', column, this.defaultEvent);
            }
        },
        sortMultipleSelectIndex(index) {
            if (index !== -1) {
                this.sortMultipleSelect = this.columns[index];
            } else {
                this.sortMultipleSelect = null;
            }
        },
        mobileSort(column) {
            if (this.currentSortColumn === column) return

            this.$emit('sort', column, this.defaultEvent);
        },
        mobileSortIndex(index) {
            if (index !== -1) {
                this.mobileSort = this.columns[index];
            } else {
                this.mobileSort = null;
            }
        },
        currentSortColumn(column) {
            this.mobileSortIndex = this.columns.indexOf(column);
        },
        columns(newColumns) {
            if (this.sortMultiple) {
                this.sortMultipleSelectIndex = newColumns.indexOf(
                    this.sortMultipleSelect
                );
            } else {
                this.mobileSortIndex = newColumns.indexOf(this.mobileSort);
            }
        }
    },
    methods: {
        removePriority() {
            this.$emit('removePriority', this.sortMultipleSelect);
            // ignore the watcher to sort when we just change whats displayed in the select
            // otherwise the direction will be flipped
            // The sort event is already triggered by the emit
            this.ignoreSort = true;
            // Select one of the other options when we reset one
            const remainingFields = this.sortMultipleData.filter((data) =>
                data.field !== this.sortMultipleSelect.field)
                .map((data) => data.field);
            this.sortMultipleSelectIndex = this.columns.findIndex((column) =>
                remainingFields.includes(column.field));
        },
        getSortingObjectOfColumn(column) {
            return this.sortMultipleData.filter((i) =>
                i.field === column.field)[0]
        },
        columnIsDesc(column) {
            const sortingObject = this.getSortingObjectOfColumn(column);
            if (sortingObject) {
                return !!(sortingObject.order && sortingObject.order === 'desc')
            }
            return true
        },
        getLabel(column) {
            const sortingObject = this.getSortingObjectOfColumn(column);
            if (sortingObject) {
                return column.label + '(' + (this.sortMultipleData.indexOf(sortingObject) + 1) + ')'
            }
            return column.label
        },
        sort() {
            this.$emit('sort', (this.sortMultiple ? this.sortMultipleSelect : this.mobileSort), this.defaultEvent);
        }
    }
};

const _hoisted_1$7 = { class: "field table-mobile-sort" };
const _hoisted_2$6 = { class: "field has-addons" };
const _hoisted_3$4 = ["value"];
const _hoisted_4$2 = ["value"];
const _hoisted_5$1 = { class: "control" };

function render$8(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_select = resolveComponent("b-select");
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("div", _hoisted_1$7, [
    createElementVNode("div", _hoisted_2$6, [
      ($props.sortMultiple)
        ? (openBlock(), createBlock(_component_b_select, {
            key: 0,
            modelValue: $data.sortMultipleSelectIndex,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($data.sortMultipleSelectIndex) = $event)),
            expanded: ""
          }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList($options.sortableColumns, (column, index) => {
                return (openBlock(), createElementBlock("option", {
                  key: index,
                  value: index
                }, [
                  createTextVNode(toDisplayString($options.getLabel(column)) + " ", 1 /* TEXT */),
                  ($options.getSortingObjectOfColumn(column))
                    ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                        ($options.columnIsDesc(column))
                          ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                              createTextVNode(" ↓ ")
                            ], 64 /* STABLE_FRAGMENT */))
                          : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                              createTextVNode(" ↑ ")
                            ], 64 /* STABLE_FRAGMENT */))
                      ], 64 /* STABLE_FRAGMENT */))
                    : createCommentVNode("v-if", true)
                ], 8 /* PROPS */, _hoisted_3$4))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["modelValue"]))
        : (openBlock(), createBlock(_component_b_select, {
            key: 1,
            modelValue: $data.mobileSortIndex,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($data.mobileSortIndex) = $event)),
            expanded: ""
          }, {
            default: withCtx(() => [
              ($props.placeholder)
                ? withDirectives((openBlock(), createElementBlock("option", {
                    key: 0,
                    value: {},
                    selected: "",
                    disabled: "",
                    hidden: ""
                  }, toDisplayString($props.placeholder), 513 /* TEXT, NEED_PATCH */)), [
                    [vShow, $options.showPlaceholder]
                  ])
                : createCommentVNode("v-if", true),
              (openBlock(true), createElementBlock(Fragment, null, renderList($options.sortableColumns, (column, index) => {
                return (openBlock(), createElementBlock("option", {
                  key: index,
                  value: index
                }, toDisplayString(column.label), 9 /* TEXT, PROPS */, _hoisted_4$2))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _: 1 /* STABLE */
          }, 8 /* PROPS */, ["modelValue"])),
      createElementVNode("div", _hoisted_5$1, [
        ($props.sortMultiple && $props.sortMultipleData.length > 0)
          ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createElementVNode("button", {
                class: "button is-primary",
                onClick: _cache[2] || (_cache[2] = (...args) => ($options.sort && $options.sort(...args)))
              }, [
                createVNode(_component_b_icon, {
                  class: normalizeClass({ 'is-desc': $options.columnIsDesc($data.sortMultipleSelect) }),
                  icon: $props.sortIcon,
                  pack: $props.iconPack,
                  size: $props.sortIconSize,
                  both: ""
                }, null, 8 /* PROPS */, ["class", "icon", "pack", "size"])
              ]),
              createElementVNode("button", {
                class: "button is-primary",
                onClick: _cache[3] || (_cache[3] = (...args) => ($options.removePriority && $options.removePriority(...args)))
              }, [
                createVNode(_component_b_icon, {
                  icon: "delete",
                  size: $props.sortIconSize,
                  both: ""
                }, null, 8 /* PROPS */, ["size"])
              ])
            ], 64 /* STABLE_FRAGMENT */))
          : (!$props.sortMultiple)
            ? (openBlock(), createElementBlock("button", {
                key: 1,
                class: "button is-primary",
                onClick: _cache[4] || (_cache[4] = (...args) => ($options.sort && $options.sort(...args)))
              }, [
                withDirectives(createVNode(_component_b_icon, {
                  class: normalizeClass({ 'is-desc': !$props.isAsc }),
                  icon: $props.sortIcon,
                  pack: $props.iconPack,
                  size: $props.sortIconSize,
                  both: ""
                }, null, 8 /* PROPS */, ["class", "icon", "pack", "size"]), [
                  [vShow, $props.currentSortColumn === $data.mobileSort]
                ])
              ]))
            : createCommentVNode("v-if", true)
      ])
    ])
  ]))
}

script$a.render = render$8;
script$a.__file = "src/components/table/TableMobileSort.vue";

var script$9 = {
    name: 'BTableColumn',
    inject: {
        $table: { name: '$table', default: false }
    },
    props: {
        label: String,
        customKey: [String, Number],
        field: String,
        meta: [String, Number, Boolean, Function, Object, Array],
        width: [Number, String],
        numeric: Boolean,
        centered: Boolean,
        searchable: Boolean,
        sortable: Boolean,
        visible: {
            type: Boolean,
            default: true
        },
        subheading: [String, Number],
        customSort: Function,
        customSearch: Function,
        sticky: Boolean,
        headerSelectable: Boolean,
        headerClass: String,
        cellClass: String,
        thAttrs: {
            type: Function,
            default: () => ({})
        },
        tdAttrs: {
            type: Function,
            default: () => ({})
        }
    },
    data() {
        return {
            newKey: this.customKey || this.label,
            _isTableColumn: true
        }
    },
    computed: {
        thClasses() {
            const attrs = this.thAttrs(this);
            const classes = [this.headerClass, {
                'is-sortable': this.sortable,
                'is-sticky': this.sticky,
                'is-unselectable': this.isHeaderUnSelectable
            }];
            if (attrs && attrs.class) {
                classes.push(attrs.class);
            }
            return classes
        },
        thStyle() {
            const attrs = this.thAttrs(this);
            const style = [this.style];
            if (attrs && attrs.style) {
                style.push(attrs.style);
            }
            return style
        },
        rootClasses() {
            return [this.cellClass, {
                'has-text-right': this.numeric && !this.centered,
                'has-text-centered': this.centered,
                'is-sticky': this.sticky
            }]
        },
        style() {
            return {
                width: toCssWidth(this.width)
            }
        },
        hasDefaultSlot() {
            return !!this.$slots.default
        },
        /**
         * Return if column header is un-selectable
         */
        isHeaderUnSelectable() {
            return !this.headerSelectable && this.sortable
        }
    },
    methods: {
        getRootClasses(row) {
            const attrs = this.tdAttrs(row, this);
            const classes = [this.rootClasses];
            if (attrs && attrs.class) {
                classes.push(attrs.class);
            }
            return classes
        },
        getRootStyle(row) {
            const attrs = this.tdAttrs(row, this);
            const style = [];
            if (attrs && attrs.style) {
                style.push(attrs.style);
            }
            return style
        }
    },
    created() {
        if (!this.$table) {
            throw new Error('You should wrap bTableColumn on a bTable')
        }
        this.$table._registerTableColumn(this);
    },
    beforeUnmount() {
        this.$table._unregisterTableColumn(this);
    },
    render(createElement) {
        // renderless
        return null
    }
};

script$9.__file = "src/components/table/TableColumn.vue";

var script$8 = {
    name: 'BTablePagination',
    components: {
        [script$o.name]: script$o
    },
    props: {
        paginated: Boolean,
        total: [Number, String],
        perPage: [Number, String],
        currentPage: [Number, String],
        paginationSimple: Boolean,
        paginationSize: String,
        rounded: Boolean,
        iconPack: String,
        ariaNextLabel: String,
        ariaPreviousLabel: String,
        ariaPageLabel: String,
        ariaCurrentLabel: String,
        pageInput: Boolean,
        paginationOrder: String,
        pageInputPosition: String,
        debouncePageInput: [Number, String]
    },
    emits: ['page-change', 'update:currentPage'],
    data() {
        return {
            newCurrentPage: this.currentPage
        }
    },
    watch: {
        currentPage(newVal) {
            this.newCurrentPage = newVal;
        }
    },
    methods: {
        /**
        * Paginator change listener.
        */
        pageChanged(page) {
            this.newCurrentPage = page > 0 ? page : 1;
            this.$emit('update:currentPage', this.newCurrentPage);
            this.$emit('page-change', this.newCurrentPage);
        }
    }
};

const _hoisted_1$6 = { class: "top level" };
const _hoisted_2$5 = { class: "level-left" };
const _hoisted_3$3 = { class: "level-right" };
const _hoisted_4$1 = {
  key: 0,
  class: "level-item"
};

function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_pagination = resolveComponent("b-pagination");

  return (openBlock(), createElementBlock("div", _hoisted_1$6, [
    createElementVNode("div", _hoisted_2$5, [
      renderSlot(_ctx.$slots, "default")
    ]),
    createElementVNode("div", _hoisted_3$3, [
      ($props.paginated)
        ? (openBlock(), createElementBlock("div", _hoisted_4$1, [
            createVNode(_component_b_pagination, {
              "icon-pack": $props.iconPack,
              total: $props.total,
              "per-page": $props.perPage,
              simple: $props.paginationSimple,
              size: $props.paginationSize,
              "model-value": $data.newCurrentPage,
              rounded: $props.rounded,
              onChange: $options.pageChanged,
              "aria-next-label": $props.ariaNextLabel,
              "aria-previous-label": $props.ariaPreviousLabel,
              "aria-page-label": $props.ariaPageLabel,
              "aria-current-label": $props.ariaCurrentLabel,
              "page-input": $props.pageInput,
              order: $props.paginationOrder,
              "page-input-position": $props.pageInputPosition,
              "debounce-page-input": $props.debouncePageInput
            }, null, 8 /* PROPS */, ["icon-pack", "total", "per-page", "simple", "size", "model-value", "rounded", "onChange", "aria-next-label", "aria-previous-label", "aria-page-label", "aria-current-label", "page-input", "order", "page-input-position", "debounce-page-input"])
          ]))
        : createCommentVNode("v-if", true)
    ])
  ]))
}

script$8.render = render$7;
script$8.__file = "src/components/table/TablePagination.vue";

var tinyEmitter = {exports: {}};

function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    }
    listener._ = callback;
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

tinyEmitter.exports = E;
tinyEmitter.exports.TinyEmitter = E;

var Emitter = tinyEmitter.exports;

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function mockTableColumn(table, column) {
  var eventEmitter = new Emitter();
  var defaultProps = {
    label: undefined,
    customKey: undefined,
    field: undefined,
    meta: undefined,
    width: undefined,
    numeric: undefined,
    centered: undefined,
    searchable: undefined,
    sortable: undefined,
    visible: true,
    subheading: undefined,
    customSort: undefined,
    customSearch: undefined,
    sticky: undefined,
    headerSelectable: undefined,
    headerClass: undefined,
    thAttrs: function thAttrs() {
      return {};
    },
    tdAttrs: function tdAttrs() {
      return {};
    }
  };
  return _objectSpread$1(_objectSpread$1(_objectSpread$1({}, defaultProps), column), {}, {
    // data
    parent: table,
    newKey: column.customKey || column.label,
    _isTableColumn: true,
    // inject
    $table: table,
    // computed
    get thClasses() {
      var attrs = this.thAttrs(this);
      var classes = [this.headerClass, {
        'is-sortable': this.sortable,
        'is-sticky': this.sticky,
        'is-unselectable': this.isHeaderUnSelectable
      }];
      if (attrs && attrs.class) {
        classes.push(attrs.class);
      }
      return classes;
    },
    get thStyle() {
      var attrs = this.thAttrs(this);
      var style = [this.style];
      if (attrs && attrs.style) {
        style.push(attrs.style);
      }
      return style;
    },
    get rootClasses() {
      return [this.cellClass, {
        'has-text-right': this.numeric && !this.centered,
        'has-text-centered': this.centered,
        'is-sticky': this.sticky
      }];
    },
    get style() {
      return {
        width: toCssWidth(this.width)
      };
    },
    get hasDefaultSlot() {
      return !!this.$scopedSlots.default;
    },
    get isHeaderUnSelectable() {
      return !this.headerSelectable && this.sortable;
    },
    // methods
    getRootClasses: function getRootClasses(row) {
      var attrs = this.tdAttrs(row, this);
      var classes = [this.rootClasses];
      if (attrs && attrs.class) {
        classes.push(attrs.class);
      }
      return classes;
    },
    getRootStyle: function getRootStyle(row) {
      var attrs = this.tdAttrs(row, this);
      var style = [];
      if (attrs && attrs.style) {
        style.push(attrs.style);
      }
      return style;
    },
    $on: function $on() {
      return eventEmitter.on.apply(eventEmitter, arguments);
    },
    $once: function $once() {
      return eventEmitter.once.apply(eventEmitter, arguments);
    },
    $off: function $off() {
      return eventEmitter.off.apply(eventEmitter, arguments);
    },
    $emit: function $emit() {
      return eventEmitter.emit.apply(eventEmitter, arguments);
    },
    // special fields
    _isVue: true,
    $slots: {
      default: function _default(props) {
        var vnode = h('span', {
          innerHTML: getValueByPath(props.row, column.field)
        });
        return [vnode];
      }
    }
  });
}

var script$7 = {
    name: 'BTable',
    components: {
        [script$Z.name]: script$Z,
        [script$17.name]: script$17,
        [script$16.name]: script$16,
        [script$C.name]: script$C,
        [SlotComponent.name]: SlotComponent,
        [script$a.name]: script$a,
        [script$9.name]: script$9,
        [script$8.name]: script$8
    },
    inheritAttrs: false,
    provide() {
        return {
            $table: this
        }
    },
    props: {
        data: {
            type: Array,
            default: () => []
        },
        columns: {
            type: Array,
            default: () => []
        },
        bordered: Boolean,
        striped: Boolean,
        narrowed: Boolean,
        hoverable: Boolean,
        loading: Boolean,
        detailed: Boolean,
        checkable: Boolean,
        headerCheckable: {
            type: Boolean,
            default: true
        },
        checkboxType: {
            type: String,
            default: 'is-primary'
        },
        checkboxPosition: {
            type: String,
            default: 'left',
            validator: (value) => {
                return [
                    'left',
                    'right'
                ].indexOf(value) >= 0
            }
        },
        stickyCheckbox: {
            type: Boolean,
            default: false
        },
        selected: Object,
        isRowSelectable: {
            type: Function,
            default: () => true
        },
        focusable: Boolean,
        customIsChecked: Function,
        isRowCheckable: {
            type: Function,
            default: () => true
        },
        checkedRows: {
            type: Array,
            default: () => []
        },
        mobileCards: {
            type: Boolean,
            default: true
        },
        defaultSort: [String, Array],
        defaultSortDirection: {
            type: String,
            default: 'asc'
        },
        sortIcon: {
            type: String,
            default: 'arrow-up'
        },
        sortIconSize: {
            type: String,
            default: 'is-small'
        },
        sortMultiple: {
            type: Boolean,
            default: false
        },
        sortMultipleData: {
            type: Array,
            default: () => []
        },
        sortMultipleKey: {
            type: String,
            default: null
        },
        paginated: Boolean,
        currentPage: {
            type: Number,
            default: 1
        },
        perPage: {
            type: [Number, String],
            default: 20
        },
        showDetailIcon: {
            type: Boolean,
            default: true
        },
        detailIcon: {
            type: String,
            default: 'chevron-right'
        },
        paginationPosition: {
            type: String,
            default: 'bottom',
            validator: (value) => {
                return [
                    'bottom',
                    'top',
                    'both'
                ].indexOf(value) >= 0
            }
        },
        paginationRounded: Boolean,
        backendSorting: Boolean,
        backendFiltering: Boolean,
        rowClass: {
            type: Function,
            default: () => ''
        },
        openedDetailed: {
            type: Array,
            default: () => []
        },
        hasDetailedVisible: {
            type: Function,
            default: () => true
        },
        detailKey: {
            type: String,
            default: ''
        },
        detailTransition: {
            type: String,
            default: ''
        },
        customDetailRow: {
            type: Boolean,
            default: false
        },
        backendPagination: Boolean,
        total: {
            type: [Number, String],
            default: 0
        },
        iconPack: String,
        mobileSortPlaceholder: String,
        customRowKey: String,
        draggable: {
            type: Boolean,
            default: false
        },
        draggableColumn: {
            type: Boolean,
            default: false
        },
        scrollable: Boolean,
        ariaNextLabel: String,
        ariaPreviousLabel: String,
        ariaPageLabel: String,
        ariaCurrentLabel: String,
        stickyHeader: Boolean,
        height: [Number, String],
        filtersEvent: {
            type: String,
            default: ''
        },
        cardLayout: Boolean,
        showHeader: {
            type: Boolean,
            default: true
        },
        debounceSearch: Number,
        caption: String,
        showCaption: {
            type: Boolean,
            default: true
        },
        pageInput: {
            type: Boolean,
            default: false
        },
        paginationOrder: String,
        pageInputPosition: String,
        debouncePageInput: [Number, String]
    },
    emits: [
        'cellclick',
        'check',
        'check-all',
        'click',
        'columndragend',
        'columndragleave',
        'columndragover',
        'columndragstart',
        'columndrop',
        'contextmenu',
        'dblclick',
        'details-close',
        'details-open',
        'dragend',
        'dragleave',
        'dragover',
        'dragstart',
        'drop',
        'filters-change',
        'page-change',
        'select',
        'sort',
        'sorting-priority-removed',
        'update:checkedRows',
        'update:currentPage',
        'update:openedDetailed',
        'update:selected'
    ],
    data() {
        return {
            sortMultipleDataLocal: [],
            getValueByPath,
            visibleDetailRows: this.openedDetailed,
            newData: this.data,
            newDataTotal: this.backendPagination ? this.total : this.data.length,
            newCheckedRows: [...this.checkedRows],
            lastCheckedRowIndex: null,
            newCurrentPage: this.currentPage,
            currentSortColumn: {},
            isAsc: true,
            filters: {},
            defaultSlots: [],
            firstTimeSort: true, // Used by first time initSort
            _isTable: true, // Used by TableColumn
            isDraggingRow: false,
            isDraggingColumn: false
        }
    },
    computed: {
        sortMultipleDataComputed() {
            return this.backendSorting ? this.sortMultipleData : this.sortMultipleDataLocal
        },
        tableClasses() {
            return {
                'is-bordered': this.bordered,
                'is-striped': this.striped,
                'is-narrow': this.narrowed,
                'is-hoverable': (
                    (this.hoverable || this.focusable) &&
                    this.visibleData.length
                )
            }
        },
        tableWrapperClasses() {
            return {
                'has-mobile-cards': this.mobileCards,
                'has-sticky-header': this.stickyHeader,
                'is-card-list': this.cardLayout,
                'table-container': this.isScrollable
            }
        },
        tableStyle() {
            return {
                height: toCssWidth(this.height)
            }
        },

        /**
        * Splitted data based on the pagination.
        */
        visibleData() {
            if (!this.paginated) return this.newData

            const currentPage = this.newCurrentPage;
            const perPage = this.perPage;

            if (this.newData.length <= perPage) {
                return this.newData
            } else {
                const start = (currentPage - 1) * perPage;
                const end = parseInt(start, 10) + parseInt(perPage, 10);
                return this.newData.slice(start, end)
            }
        },

        visibleColumns() {
            if (!this.newColumns) return this.newColumns
            return this.newColumns.filter((column) => {
                return column.visible || column.visible === undefined
            })
        },

        /**
        * Check if all rows in the page are checked.
        */
        isAllChecked() {
            const validVisibleData = this.visibleData.filter(
                (row) => this.isRowCheckable(row));
            if (validVisibleData.length === 0) return false
            const isAllChecked = validVisibleData.some((currentVisibleRow) => {
                return indexOf(this.newCheckedRows, currentVisibleRow, this.customIsChecked) < 0
            });
            return !isAllChecked
        },

        /**
        * Check if all rows in the page are checkable.
        */
        isAllUncheckable() {
            const validVisibleData = this.visibleData.filter(
                (row) => this.isRowCheckable(row));
            return validVisibleData.length === 0
        },

        /**
        * Check if has any sortable column.
        */
        hasSortablenewColumns() {
            return this.newColumns.some((column) => {
                return column.sortable
            })
        },

        /**
        * Check if has any searchable column.
        */
        hasSearchablenewColumns() {
            return this.newColumns.some((column) => {
                return column.searchable
            })
        },

        /**
        * Check if has any column using subheading.
        */
        hasCustomSubheadings() {
            if (this.$slots && this.$slots.subheading) return true
            return this.newColumns.some((column) => {
                return column.subheading || column.$slots.subheading
            })
        },

        /**
        * Return total column count based if it's checkable or expanded
        */
        columnCount() {
            let count = this.visibleColumns.length;
            count += this.checkable ? 1 : 0;
            count += (this.detailed && this.showDetailIcon) ? 1 : 0;

            return count
        },

        /**
        * return if detailed row tabled
        * will be with chevron column & icon or not
        */
        showDetailRowIcon() {
            return this.detailed && this.showDetailIcon
        },

        /**
        * return if scrollable table
        */
        isScrollable() {
            if (this.scrollable) return true
            if (!this.newColumns) return false
            return this.newColumns.some((column) => {
                return column.sticky
            })
        },

        newColumns() {
            if (this.columns && this.columns.length) {
                return this.columns.map((column) => {
                    return mockTableColumn(this, column)
                })
            }
            return this.defaultSlots
        },
        canDragRow() {
            return this.draggable && !this.isDraggingColumn
        },
        canDragColumn() {
            return this.draggableColumn && !this.isDraggingRow
        }
    },
    watch: {
        /**
        * When data prop change:
        *   1. Update internal value.
        *   2. Filter data if it's not backend-filtered.
        *   3. Sort again if it's not backend-sorted.
        *   4. Set new total if it's not backend-paginated.
        */
        data(value) {
            this.newData = value;
            if (!this.backendFiltering) {
                this.newData = value.filter(
                    (row) => this.isRowFiltered(row));
            }
            if (!this.backendSorting) {
                this.sort(this.currentSortColumn, true);
            }
            if (!this.backendPagination) {
                this.newDataTotal = this.newData.length;
            }
        },

        /**
        * When Pagination total change, update internal total
        * only if it's backend-paginated.
        */
        total(newTotal) {
            if (!this.backendPagination) return

            this.newDataTotal = newTotal;
        },

        currentPage(newVal) {
            this.newCurrentPage = newVal;
        },

        newCurrentPage(newVal) {
            this.$emit('update:currentPage', newVal);
        },

        /**
        * When checkedRows prop change, update internal value without
        * mutating original data.
        */
        checkedRows(rows) {
            this.newCheckedRows = [...rows];
        },

        /*
        newColumns(value) {
            this.checkSort()
        },
        */

        debounceSearch: {
            handler(value) {
                this.debouncedHandleFiltersChange = debounce(this.handleFiltersChange, value);
            },
            immediate: true
        },

        filters: {
            handler(value) {
                if (this.debounceSearch) {
                    this.debouncedHandleFiltersChange(value);
                } else {
                    this.handleFiltersChange(value);
                }
            },
            deep: true
        },

        /**
        * When the user wants to control the detailed rows via props.
        * Or wants to open the details of certain row with the router for example.
        */
        openedDetailed(expandedRows) {
            this.visibleDetailRows = expandedRows;
        }
    },
    methods: {
        onFiltersEvent(event) {
            this.$emit(`filters-event-${this.filtersEvent}`, { event, filters: this.filters });
        },
        handleFiltersChange(value) {
            if (this.backendFiltering) {
                this.$emit('filters-change', value);
            } else {
                this.newData = this.data.filter(
                    (row) => this.isRowFiltered(row));
                if (!this.backendPagination) {
                    this.newDataTotal = this.newData.length;
                }
                if (!this.backendSorting) {
                    if (this.sortMultiple &&
                        this.sortMultipleDataLocal && this.sortMultipleDataLocal.length > 0) {
                        this.doSortMultiColumn();
                    } else if (Object.keys(this.currentSortColumn).length > 0) {
                        this.doSortSingleColumn(this.currentSortColumn);
                    }
                }
            }
        },
        findIndexOfSortData(column) {
            const sortObj = this.sortMultipleDataComputed.filter((i) =>
                i.field === column.field)[0];
            return this.sortMultipleDataComputed.indexOf(sortObj) + 1
        },
        removeSortingPriority(column) {
            if (this.backendSorting) {
                this.$emit('sorting-priority-removed', column.field);
            } else {
                this.sortMultipleDataLocal = this.sortMultipleDataLocal.filter(
                    (priority) => priority.field !== column.field);

                const formattedSortingPriority = this.sortMultipleDataLocal.map((i) => {
                    return (i.order && i.order === 'desc' ? '-' : '') + i.field
                });

                if (formattedSortingPriority.length === 0) {
                    this.resetMultiSorting();
                } else {
                    this.newData = multiColumnSort(this.newData, formattedSortingPriority);
                }
            }
        },
        resetMultiSorting() {
            this.sortMultipleDataLocal = [];
            this.currentSortColumn = {};
            this.newData = this.data;
        },
        /**
        * Sort an array by key without mutating original data.
        * Call the user sort function if it was passed.
        */
        sortBy(array, key, fn, isAsc) {
            let sorted = [];
            // Sorting without mutating original data
            if (fn && typeof fn === 'function') {
                sorted = [...array].sort((a, b) => fn(a, b, isAsc));
            } else {
                sorted = [...array].sort((a, b) => {
                    // Get nested values from objects
                    let newA = getValueByPath(a, key);
                    let newB = getValueByPath(b, key);

                    // sort boolean type
                    if (typeof newA === 'boolean' && typeof newB === 'boolean') {
                        return isAsc ? newA - newB : newB - newA
                    }

                    // sort null values to the bottom when in asc order
                    // and to the top when in desc order
                    if (!isNil(newB) && isNil(newA)) return isAsc ? 1 : -1
                    if (!isNil(newA) && isNil(newB)) return isAsc ? -1 : 1
                    if (newA === newB) return 0

                    newA = (typeof newA === 'string')
                        ? newA.toUpperCase()
                        : newA;
                    newB = (typeof newB === 'string')
                        ? newB.toUpperCase()
                        : newB;

                    return isAsc
                        ? newA > newB ? 1 : -1
                        : newA > newB ? -1 : 1
                });
            }

            return sorted
        },

        sortMultiColumn(column) {
            this.currentSortColumn = {};
            if (!this.backendSorting) {
                const existingPriority = this.sortMultipleDataLocal.filter((i) =>
                    i.field === column.field)[0];
                if (existingPriority) {
                    existingPriority.order = existingPriority.order === 'desc' ? 'asc' : 'desc';
                } else {
                    this.sortMultipleDataLocal.push(
                        { field: column.field, order: column.isAsc }
                    );
                }
                this.doSortMultiColumn();
            }
        },

        doSortMultiColumn() {
            const formattedSortingPriority = this.sortMultipleDataLocal.map((i) => {
                return (i.order && i.order === 'desc' ? '-' : '') + i.field
            });
            this.newData = multiColumnSort(this.newData, formattedSortingPriority);
        },

        /**
        * Sort the column.
        * Toggle current direction on column if it's sortable
        * and not just updating the prop.
        */
        sort(column, updatingData = false, event = null) {
            if (!column || !column.sortable) return
            if (
                // if backend sorting is enabled, just emit the sort press like usual
                // if the correct key combination isnt pressed, sort like usual
                !this.backendSorting &&
                this.sortMultiple &&
                ((this.sortMultipleKey && event[this.sortMultipleKey]) || !this.sortMultipleKey)
            ) {
                if (updatingData) {
                    this.doSortMultiColumn();
                } else {
                    this.sortMultiColumn(column);
                }
            } else {
                // sort multiple is enabled but the correct key combination isnt pressed so reset
                if (this.sortMultiple) {
                    this.sortMultipleDataLocal = [];
                }

                if (!updatingData) {
                    this.isAsc = column === this.currentSortColumn
                        ? !this.isAsc
                        : (this.defaultSortDirection.toLowerCase() !== 'desc');
                }
                if (!this.firstTimeSort) {
                    this.$emit('sort', column.field, this.isAsc ? 'asc' : 'desc', event);
                }
                if (!this.backendSorting) {
                    this.doSortSingleColumn(column);
                }
                this.currentSortColumn = column;
            }
        },

        doSortSingleColumn(column) {
            this.newData = this.sortBy(
                this.newData,
                column.field,
                column.customSort,
                this.isAsc
            );
        },

        isRowSelected(row, selected) {
            if (!selected) {
                return false
            }
            if (this.customRowKey) {
                return row[this.customRowKey] === selected[this.customRowKey]
            }
            return row === selected
        },

        /**
        * Check if the row is checked (is added to the array).
        */
        isRowChecked(row) {
            return indexOf(this.newCheckedRows, row, this.customIsChecked) >= 0
        },

        /**
        * Remove a checked row from the array.
        */
        removeCheckedRow(row) {
            const index = indexOf(this.newCheckedRows, row, this.customIsChecked);
            if (index >= 0) {
                this.newCheckedRows.splice(index, 1);
            }
        },

        /**
        * Header checkbox click listener.
        * Add or remove all rows in current page.
        */
        checkAll() {
            const isAllChecked = this.isAllChecked;
            this.visibleData.forEach((currentRow) => {
                if (this.isRowCheckable(currentRow)) {
                    this.removeCheckedRow(currentRow);
                }
                if (!isAllChecked) {
                    if (this.isRowCheckable(currentRow)) {
                        this.newCheckedRows.push(currentRow);
                    }
                }
            });

            this.$emit('check', this.newCheckedRows);
            this.$emit('check-all', this.newCheckedRows);

            // Emit checked rows to update user variable
            this.$emit('update:checkedRows', this.newCheckedRows);
        },

        /**
        * Row checkbox click listener.
        */
        checkRow(row, index, event) {
            if (!this.isRowCheckable(row)) return
            const lastIndex = this.lastCheckedRowIndex;
            this.lastCheckedRowIndex = index;

            if (event.shiftKey && lastIndex !== null && index !== lastIndex) {
                this.shiftCheckRow(row, index, lastIndex);
            } else if (!this.isRowChecked(row)) {
                this.newCheckedRows.push(row);
            } else {
                this.removeCheckedRow(row);
            }

            this.$emit('check', this.newCheckedRows, row);

            // Emit checked rows to update user variable
            this.$emit('update:checkedRows', this.newCheckedRows);
        },

        /**
         * Check row when shift is pressed.
         */
        shiftCheckRow(row, index, lastCheckedRowIndex) {
            // Get the subset of the list between the two indicies
            const subset = this.visibleData.slice(
                Math.min(index, lastCheckedRowIndex),
                Math.max(index, lastCheckedRowIndex) + 1
            );

            // Determine the operation based on the state of the clicked checkbox
            const shouldCheck = !this.isRowChecked(row);

            subset.forEach((item) => {
                this.removeCheckedRow(item);
                if (shouldCheck && this.isRowCheckable(item)) {
                    this.newCheckedRows.push(item);
                }
            });
        },

        /**
        * Row click listener.
        * Emit all necessary events.
        */
        selectRow(row, index) {
            this.$emit('click', row);

            if (this.selected === row) return
            if (!this.isRowSelectable(row)) return

            // Emit new and old row
            this.$emit('select', row, this.selected);

            // Emit new row to update user variable
            this.$emit('update:selected', row);
        },

        /**
        * Toggle to show/hide details slot
        */
        toggleDetails(obj) {
            const found = this.isVisibleDetailRow(obj);

            if (found) {
                this.closeDetailRow(obj);
                this.$emit('details-close', obj);
            } else {
                this.openDetailRow(obj);
                this.$emit('details-open', obj);
            }

            // Syncs the detailed rows with the parent component
            this.$emit('update:openedDetailed', this.visibleDetailRows);
        },

        openDetailRow(obj) {
            const index = this.handleDetailKey(obj);
            this.visibleDetailRows.push(index);
        },

        closeDetailRow(obj) {
            const index = this.handleDetailKey(obj);
            const i = this.visibleDetailRows.indexOf(index);
            if (i >= 0) {
                this.visibleDetailRows.splice(i, 1);
            }
        },

        isVisibleDetailRow(obj) {
            const index = this.handleDetailKey(obj);
            return this.visibleDetailRows.indexOf(index) >= 0
        },

        isActiveDetailRow(row) {
            return this.detailed && !this.customDetailRow && this.isVisibleDetailRow(row)
        },

        isActiveCustomDetailRow(row) {
            return this.detailed && this.customDetailRow && this.isVisibleDetailRow(row)
        },

        isRowFiltered(row) {
            for (const key in this.filters) {
                if (!this.filters[key]) continue
                const input = this.filters[key];
                const column = this.newColumns.filter((c) => c.field === key)[0];
                if (column && column.customSearch && typeof column.customSearch === 'function') {
                    if (!column.customSearch(row, input)) return false
                } else {
                    const value = this.getValueByPath(row, key);
                    if (value == null) return false
                    if (Number.isInteger(value)) {
                        if (value !== Number(input)) return false
                    } else {
                        const re = new RegExp(escapeRegExpChars(input), 'i');
                        if (Array.isArray(value)) {
                            const valid = value.some((val) =>
                                re.test(removeDiacriticsFromString(val)) || re.test(val)
                            );
                            if (!valid) return false
                        } else {
                            if (!re.test(removeDiacriticsFromString(value)) && !re.test(value)) {
                                return false
                            }
                        }
                    }
                }
            }
            return true
        },

        /**
        * When the detailKey is defined we use the object[detailKey] as index.
        * If not, use the object reference by default.
        */
        handleDetailKey(index) {
            const key = this.detailKey;
            return !key.length || !index
                ? index
                : index[key]
        },

        checkPredefinedDetailedRows() {
            const defaultExpandedRowsDefined = this.openedDetailed.length > 0;
            if (defaultExpandedRowsDefined && !this.detailKey.length) {
                throw new Error('If you set a predefined opened-detailed, you must provide a unique key using the prop "detail-key"')
            }
        },

        /**
        * Call initSort only first time (For example async data).
        */
        checkSort() {
            if (this.newColumns.length && this.firstTimeSort) {
                this.initSort();
                this.firstTimeSort = false;
            } else if (this.newColumns.length) {
                if (Object.keys(this.currentSortColumn).length > 0) {
                    for (let i = 0; i < this.newColumns.length; i++) {
                        if (this.newColumns[i].field === this.currentSortColumn.field) {
                            this.currentSortColumn = this.newColumns[i];
                            break
                        }
                    }
                }
            }
        },

        /**
        * Check if footer slot has custom content.
        *
        * Assumes that `$slots.footer` is specified.
        */
        hasCustomFooterSlot() {
            const footer = this.$slots.footer();
            if (footer.length > 1) return true

            // if a template is specified to `footer`, `footer.length` is 1
            // but should contain multiple elements.
            if (isFragment(footer[0])) return true

            const tag = footer[0].tag;
            if (tag !== 'th' && tag !== 'td') return false

            return true
        },

        /**
        * Check if bottom-left slot exists.
        */
        hasBottomLeftSlot() {
            return typeof this.$slots['bottom-left'] !== 'undefined'
        },

        /**
        * Table arrow keys listener, change selection.
        */
        pressedArrow(pos) {
            if (!this.visibleData.length) return

            let index = this.visibleData.indexOf(this.selected) + pos;

            // Prevent from going up from first and down from last
            index = index < 0
                ? 0
                : index > this.visibleData.length - 1
                    ? this.visibleData.length - 1
                    : index;

            const row = this.visibleData[index];

            if (!this.isRowSelectable(row)) {
                let newIndex = null;
                if (pos > 0) {
                    for (let i = index; i < this.visibleData.length && newIndex === null; i++) {
                        if (this.isRowSelectable(this.visibleData[i])) newIndex = i;
                    }
                } else {
                    for (let i = index; i >= 0 && newIndex === null; i--) {
                        if (this.isRowSelectable(this.visibleData[i])) newIndex = i;
                    }
                }
                if (newIndex >= 0) {
                    this.selectRow(this.visibleData[newIndex]);
                }
            } else {
                this.selectRow(row);
            }
        },

        /**
        * Focus table element if has selected prop.
        */
        focus() {
            if (!this.focusable) return

            this.$el.querySelector('table').focus();
        },

        /**
        * Initial sorted column based on the default-sort prop.
        */
        initSort() {
            if (this.sortMultiple && this.sortMultipleData) {
                this.sortMultipleData.forEach((column) => {
                    this.sortMultiColumn(column);
                });
            } else {
                if (!this.defaultSort) return

                let sortField = '';
                let sortDirection = this.defaultSortDirection;

                if (Array.isArray(this.defaultSort)) {
                    sortField = this.defaultSort[0];
                    if (this.defaultSort[1]) {
                        sortDirection = this.defaultSort[1];
                    }
                } else {
                    sortField = this.defaultSort;
                }

                const sortColumn = this.newColumns.filter(
                    (column) => (column.field === sortField))[0];
                if (sortColumn) {
                    this.isAsc = sortDirection.toLowerCase() !== 'desc';
                    this.sort(sortColumn, true);
                }
            }
        },
        /**
        * Emits drag start event (row)
        */
        handleDragStart(event, row, index) {
            if (!this.canDragRow) return
            this.isDraggingRow = true;
            this.$emit('dragstart', { event, row, index });
        },
        /**
        * Emits drag leave event (row)
        */
        handleDragEnd(event, row, index) {
            if (!this.canDragRow) return
            this.isDraggingRow = false;
            this.$emit('dragend', { event, row, index });
        },
        /**
        * Emits drop event (row)
        */
        handleDrop(event, row, index) {
            if (!this.canDragRow) return
            this.$emit('drop', { event, row, index });
        },
        /**
        * Emits drag over event (row)
        */
        handleDragOver(event, row, index) {
            if (!this.canDragRow) return
            this.$emit('dragover', { event, row, index });
        },
        /**
        * Emits drag leave event (row)
        */
        handleDragLeave(event, row, index) {
            if (!this.canDragRow) return
            this.$emit('dragleave', { event, row, index });
        },

        emitEventForRow(eventName, event, row) {
            // eventName should not be in `emits` because it is never included
            // in `$attrs` if it is listed in `emits`.
            return this.$attrs[`on${eventName}`] ? this.$emit(eventName, row, event) : null
        },

        /**
        * Emits drag start event (column)
        */
        handleColumnDragStart(event, column, index) {
            if (!this.canDragColumn) return
            this.isDraggingColumn = true;
            this.$emit('columndragstart', { event, column, index });
        },

        /**
        * Emits drag leave event (column)
        */
        handleColumnDragEnd(event, column, index) {
            if (!this.canDragColumn) return
            this.isDraggingColumn = false;
            this.$emit('columndragend', { event, column, index });
        },

        /**
        * Emits drop event (column)
        */
        handleColumnDrop(event, column, index) {
            if (!this.canDragColumn) return
            this.$emit('columndrop', { event, column, index });
        },

        /**
        * Emits drag over event (column)
        */
        handleColumnDragOver(event, column, index) {
            if (!this.canDragColumn) return
            this.$emit('columndragover', { event, column, index });
        },

        /**
        * Emits drag leave event (column)
        */
        handleColumnDragLeave(event, column, index) {
            if (!this.canDragColumn) return
            this.$emit('columndragleave', { event, column, index });
        },

        _registerTableColumn(column) {
            if (column._isTableColumn) {
                this.defaultSlots.push(column);
            }
        },
        _unregisterTableColumn(column) {
            const index = this.defaultSlots.indexOf(column);
            if (index !== -1) {
                this.defaultSlots.splice(index, 1);
            }
        }
    },
    mounted() {
        this.checkPredefinedDetailedRows();
        this.checkSort();
    }
};

const _hoisted_1$5 = { class: "b-table" };
const _hoisted_2$4 = ["tabindex"];
const _hoisted_3$2 = { key: 1 };
const _hoisted_4 = {
  key: 0,
  width: "40px"
};
const _hoisted_5 = ["onClick", "draggable", "onDragstart", "onDragend", "onDrop", "onDragover", "onDragleave"];
const _hoisted_6 = {
  key: 1,
  class: "is-relative"
};
const _hoisted_7 = ["onClick"];
const _hoisted_8 = {
  key: 0,
  class: "is-subheading"
};
const _hoisted_9 = {
  key: 0,
  width: "40px"
};
const _hoisted_10 = { key: 1 };
const _hoisted_11 = { key: 2 };
const _hoisted_12 = { key: 1 };
const _hoisted_13 = {
  key: 0,
  width: "40px"
};
const _hoisted_14 = { key: 1 };
const _hoisted_15 = { class: "th-wrap" };
const _hoisted_16 = { key: 2 };
const _hoisted_17 = ["onClick", "onDblclick", "onMouseenter", "onMouseleave", "onContextmenu", "draggable", "onDragstart", "onDragend", "onDrop", "onDragover", "onDragleave"];
const _hoisted_18 = {
  key: 0,
  class: "chevron-cell"
};
const _hoisted_19 = ["onClick"];
const _hoisted_20 = {
  key: 0,
  class: "detail"
};
const _hoisted_21 = ["colspan"];
const _hoisted_22 = { class: "detail-container" };
const _hoisted_23 = {
  key: 0,
  class: "is-empty"
};
const _hoisted_24 = ["colspan"];
const _hoisted_25 = { key: 2 };
const _hoisted_26 = { class: "table-footer" };
const _hoisted_27 = ["colspan"];

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_table_mobile_sort = resolveComponent("b-table-mobile-sort");
  const _component_b_table_pagination = resolveComponent("b-table-pagination");
  const _component_b_checkbox = resolveComponent("b-checkbox");
  const _component_b_slot_component = resolveComponent("b-slot-component");
  const _component_b_icon = resolveComponent("b-icon");
  const _component_b_input = resolveComponent("b-input");
  const _component_b_loading = resolveComponent("b-loading");

  return (openBlock(), createElementBlock("div", _hoisted_1$5, [
    renderSlot(_ctx.$slots, "default"),
    ($props.mobileCards && $options.hasSortablenewColumns)
      ? (openBlock(), createBlock(_component_b_table_mobile_sort, {
          key: 0,
          "current-sort-column": $data.currentSortColumn,
          "sort-multiple": $props.sortMultiple,
          "sort-multiple-data": $options.sortMultipleDataComputed,
          "is-asc": $data.isAsc,
          columns: $options.newColumns,
          placeholder: $props.mobileSortPlaceholder,
          "icon-pack": $props.iconPack,
          "sort-icon": $props.sortIcon,
          "sort-icon-size": $props.sortIconSize,
          onSort: _cache[0] || (_cache[0] = (column, event) => $options.sort(column, null, event)),
          onRemovePriority: _cache[1] || (_cache[1] = (column) => $options.removeSortingPriority(column))
        }, null, 8 /* PROPS */, ["current-sort-column", "sort-multiple", "sort-multiple-data", "is-asc", "columns", "placeholder", "icon-pack", "sort-icon", "sort-icon-size"]))
      : createCommentVNode("v-if", true),
    ($props.paginated && ($props.paginationPosition === 'top' || $props.paginationPosition === 'both'))
      ? renderSlot(_ctx.$slots, "pagination", { key: 1 }, () => [
          createVNode(_component_b_table_pagination, mergeProps(_ctx.$attrs, {
            "per-page": $props.perPage,
            paginated: $props.paginated,
            rounded: $props.paginationRounded,
            "icon-pack": $props.iconPack,
            total: $data.newDataTotal,
            "current-page": $data.newCurrentPage,
            "onUpdate:currentPage": _cache[2] || (_cache[2] = $event => (($data.newCurrentPage) = $event)),
            "aria-next-label": $props.ariaNextLabel,
            "aria-previous-label": $props.ariaPreviousLabel,
            "aria-page-label": $props.ariaPageLabel,
            "aria-current-label": $props.ariaCurrentLabel,
            onPageChange: _cache[3] || (_cache[3] = (event) => _ctx.$emit('page-change', event)),
            "page-input": $props.pageInput,
            "pagination-order": $props.paginationOrder,
            "page-input-position": $props.pageInputPosition,
            "debounce-page-input": $props.debouncePageInput
          }), {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "top-left")
            ]),
            _: 3 /* FORWARDED */
          }, 16 /* FULL_PROPS */, ["per-page", "paginated", "rounded", "icon-pack", "total", "current-page", "aria-next-label", "aria-previous-label", "aria-page-label", "aria-current-label", "page-input", "pagination-order", "page-input-position", "debounce-page-input"])
        ])
      : createCommentVNode("v-if", true),
    createElementVNode("div", {
      class: normalizeClass(["table-wrapper", $options.tableWrapperClasses]),
      style: normalizeStyle($options.tableStyle)
    }, [
      createElementVNode("table", {
        class: normalizeClass(["table", $options.tableClasses]),
        tabindex: !$props.focusable ? false : 0,
        onKeydown: [
          _cache[4] || (_cache[4] = withKeys(withModifiers($event => ($options.pressedArrow(-1)), ["self","prevent"]), ["up"])),
          _cache[5] || (_cache[5] = withKeys(withModifiers($event => ($options.pressedArrow(1)), ["self","prevent"]), ["down"]))
        ]
      }, [
        ($props.caption)
          ? withDirectives((openBlock(), createElementBlock("caption", { key: 0 }, toDisplayString($props.caption), 513 /* TEXT, NEED_PATCH */)), [
              [vShow, $props.showCaption]
            ])
          : createCommentVNode("v-if", true),
        ($options.newColumns.length && $props.showHeader)
          ? (openBlock(), createElementBlock("thead", _hoisted_3$2, [
              createElementVNode("tr", null, [
                ($options.showDetailRowIcon)
                  ? (openBlock(), createElementBlock("th", _hoisted_4))
                  : createCommentVNode("v-if", true),
                ($props.checkable && $props.checkboxPosition === 'left')
                  ? (openBlock(), createElementBlock("th", {
                      key: 1,
                      class: normalizeClass(['checkbox-cell', { 'is-sticky': $props.stickyCheckbox } ])
                    }, [
                      ($props.headerCheckable)
                        ? renderSlot(_ctx.$slots, "check-all", {
                            key: 0,
                            isAllChecked: $options.isAllChecked,
                            isAllUncheckable: $options.isAllUncheckable,
                            checkAll: $options.checkAll
                          }, () => [
                            createVNode(_component_b_checkbox, {
                              autocomplete: "off",
                              "model-value": $options.isAllChecked,
                              type: $props.checkboxType,
                              disabled: $options.isAllUncheckable,
                              onChange: $options.checkAll
                            }, null, 8 /* PROPS */, ["model-value", "type", "disabled", "onChange"])
                          ])
                        : createCommentVNode("v-if", true)
                    ], 2 /* CLASS */))
                  : createCommentVNode("v-if", true),
                (openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleColumns, (column, index) => {
                  return (openBlock(), createElementBlock("th", mergeProps({
                    key: column.newKey + ':' + index + 'header'
                  }, column.thAttrs(column), {
                    class: [column.thClasses, {
                                'is-current-sort': !$props.sortMultiple && $data.currentSortColumn === column,
                            }],
                    style: column.thStyle,
                    onClick: withModifiers($event => ($options.sort(column, null, $event)), ["stop"]),
                    draggable: $options.canDragColumn,
                    onDragstart: $event => ($options.handleColumnDragStart($event, column, index)),
                    onDragend: $event => ($options.handleColumnDragEnd($event, column, index)),
                    onDrop: $event => ($options.handleColumnDrop($event, column, index)),
                    onDragover: $event => ($options.handleColumnDragOver($event, column, index)),
                    onDragleave: $event => ($options.handleColumnDragLeave($event, column, index))
                  }), [
                    createElementVNode("div", {
                      class: normalizeClass(["th-wrap", {
                                    'is-numeric': column.numeric,
                                    'is-centered': column.centered
                                }])
                    }, [
                      (column.$slots.header)
                        ? (openBlock(), createBlock(_component_b_slot_component, {
                            key: 0,
                            component: column,
                            scoped: "",
                            name: "header",
                            tag: "span",
                            props: { column, index }
                          }, null, 8 /* PROPS */, ["component", "props"]))
                        : (openBlock(), createElementBlock("span", _hoisted_6, [
                            createTextVNode(toDisplayString(column.label) + " ", 1 /* TEXT */),
                            ($props.sortMultiple &&
                                                $options.sortMultipleDataComputed &&
                                                $options.sortMultipleDataComputed.length > 0 &&
                                                $options.sortMultipleDataComputed.filter(i =>
                                                    i.field === column.field).length > 0)
                              ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                                  createVNode(_component_b_icon, {
                                    icon: $props.sortIcon,
                                    pack: $props.iconPack,
                                    both: "",
                                    size: $props.sortIconSize,
                                    class: normalizeClass({
                                                    'is-desc': $options.sortMultipleDataComputed
                                                        .filter(i => i.field === column.field)[0]
                                                        .order === 'desc'})
                                  }, null, 8 /* PROPS */, ["icon", "pack", "size", "class"]),
                                  createTextVNode(" " + toDisplayString($options.findIndexOfSortData(column)) + " ", 1 /* TEXT */),
                                  createElementVNode("button", {
                                    class: "delete is-small multi-sort-cancel-icon",
                                    type: "button",
                                    onClick: withModifiers($event => ($options.removeSortingPriority(column)), ["stop"])
                                  }, null, 8 /* PROPS */, _hoisted_7)
                                ], 64 /* STABLE_FRAGMENT */))
                              : (openBlock(), createBlock(_component_b_icon, {
                                  key: 1,
                                  icon: $props.sortIcon,
                                  pack: $props.iconPack,
                                  both: "",
                                  size: $props.sortIconSize,
                                  class: normalizeClass(["sort-icon", {
                                                'is-desc': !$data.isAsc,
                                                'is-invisible': $data.currentSortColumn !== column
                                            }])
                                }, null, 8 /* PROPS */, ["icon", "pack", "size", "class"]))
                          ]))
                    ], 2 /* CLASS */)
                  ], 16 /* FULL_PROPS */, _hoisted_5))
                }), 128 /* KEYED_FRAGMENT */)),
                ($props.checkable && $props.checkboxPosition === 'right')
                  ? (openBlock(), createElementBlock("th", {
                      key: 2,
                      class: normalizeClass(['checkbox-cell', { 'is-sticky': $props.stickyCheckbox } ])
                    }, [
                      ($props.headerCheckable)
                        ? renderSlot(_ctx.$slots, "check-all", {
                            key: 0,
                            isAllChecked: $options.isAllChecked,
                            isAllUncheckable: $options.isAllUncheckable,
                            checkAll: $options.checkAll
                          }, () => [
                            createVNode(_component_b_checkbox, {
                              autocomplete: "off",
                              "model-value": $options.isAllChecked,
                              type: $props.checkboxType,
                              disabled: $options.isAllUncheckable,
                              onChange: $options.checkAll
                            }, null, 8 /* PROPS */, ["model-value", "type", "disabled", "onChange"])
                          ])
                        : createCommentVNode("v-if", true)
                    ], 2 /* CLASS */))
                  : createCommentVNode("v-if", true)
              ]),
              ($options.hasCustomSubheadings)
                ? (openBlock(), createElementBlock("tr", _hoisted_8, [
                    ($options.showDetailRowIcon)
                      ? (openBlock(), createElementBlock("th", _hoisted_9))
                      : createCommentVNode("v-if", true),
                    ($props.checkable && $props.checkboxPosition === 'left')
                      ? (openBlock(), createElementBlock("th", _hoisted_10))
                      : createCommentVNode("v-if", true),
                    (openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleColumns, (column, index) => {
                      return (openBlock(), createElementBlock("th", {
                        key: column.newKey + ':' + index + 'subheading',
                        style: normalizeStyle(column.style)
                      }, [
                        createElementVNode("div", {
                          class: normalizeClass(["th-wrap", {
                                    'is-numeric': column.numeric,
                                    'is-centered': column.centered
                                }])
                        }, [
                          (column.$slots.subheading)
                            ? (openBlock(), createBlock(_component_b_slot_component, {
                                key: 0,
                                component: column,
                                scoped: "",
                                name: "subheading",
                                tag: "span",
                                props: { column, index }
                              }, null, 8 /* PROPS */, ["component", "props"]))
                            : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                                createTextVNode(toDisplayString(column.subheading), 1 /* TEXT */)
                              ], 64 /* STABLE_FRAGMENT */))
                        ], 2 /* CLASS */)
                      ], 4 /* STYLE */))
                    }), 128 /* KEYED_FRAGMENT */)),
                    ($props.checkable && $props.checkboxPosition === 'right')
                      ? (openBlock(), createElementBlock("th", _hoisted_11))
                      : createCommentVNode("v-if", true)
                  ]))
                : createCommentVNode("v-if", true),
              ($options.hasSearchablenewColumns)
                ? (openBlock(), createElementBlock("tr", _hoisted_12, [
                    ($options.showDetailRowIcon)
                      ? (openBlock(), createElementBlock("th", _hoisted_13))
                      : createCommentVNode("v-if", true),
                    ($props.checkable && $props.checkboxPosition === 'left')
                      ? (openBlock(), createElementBlock("th", _hoisted_14))
                      : createCommentVNode("v-if", true),
                    (openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleColumns, (column, index) => {
                      return (openBlock(), createElementBlock("th", mergeProps({
                        key: column.newKey + ':' + index + 'searchable'
                      }, column.thAttrs(column), {
                        style: column.thStyle,
                        class: {'is-sticky': column.sticky}
                      }), [
                        createElementVNode("div", _hoisted_15, [
                          (column.searchable)
                            ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                                (column.$slots.searchable)
                                  ? (openBlock(), createBlock(_component_b_slot_component, {
                                      key: 0,
                                      component: column,
                                      scoped: true,
                                      name: "searchable",
                                      tag: "span",
                                      props: { column, filters: $data.filters }
                                    }, null, 8 /* PROPS */, ["component", "props"]))
                                  : (openBlock(), createBlock(_component_b_input, mergeProps({
                                      key: 1,
                                      [toHandlerKey($props.filtersEvent)]: $options.onFiltersEvent
                                    }, {
                                      modelValue: $data.filters[column.field],
                                      "onUpdate:modelValue": $event => (($data.filters[column.field]) = $event),
                                      type: column.numeric ? 'number' : 'text'
                                    }), null, 16 /* FULL_PROPS */, ["modelValue", "onUpdate:modelValue", "type"]))
                              ], 64 /* STABLE_FRAGMENT */))
                            : createCommentVNode("v-if", true)
                        ])
                      ], 16 /* FULL_PROPS */))
                    }), 128 /* KEYED_FRAGMENT */)),
                    ($props.checkable && $props.checkboxPosition === 'right')
                      ? (openBlock(), createElementBlock("th", _hoisted_16))
                      : createCommentVNode("v-if", true)
                  ]))
                : createCommentVNode("v-if", true)
            ]))
          : createCommentVNode("v-if", true),
        createElementVNode("tbody", null, [
          (openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleData, (row, index) => {
            return (openBlock(), createElementBlock(Fragment, {
              key: $props.customRowKey ? row[$props.customRowKey] : index
            }, [
              createElementVNode("tr", {
                class: normalizeClass([$props.rowClass(row, index), {
                                'is-selected': $options.isRowSelected(row, $props.selected),
                                'is-checked': $options.isRowChecked(row),
                            }]),
                onClick: $event => ($options.selectRow(row)),
                onDblclick: $event => (_ctx.$emit('dblclick', row)),
                onMouseenter: $event => ($options.emitEventForRow('mouseenter', $event, row)),
                onMouseleave: $event => ($options.emitEventForRow('mouseleave', $event, row)),
                onContextmenu: $event => (_ctx.$emit('contextmenu', row, $event)),
                draggable: $options.canDragRow,
                onDragstart: $event => ($options.handleDragStart($event, row, index)),
                onDragend: $event => ($options.handleDragEnd($event, row, index)),
                onDrop: $event => ($options.handleDrop($event, row, index)),
                onDragover: $event => ($options.handleDragOver($event, row, index)),
                onDragleave: $event => ($options.handleDragLeave($event, row, index))
              }, [
                ($options.showDetailRowIcon)
                  ? (openBlock(), createElementBlock("td", _hoisted_18, [
                      ($props.hasDetailedVisible(row))
                        ? (openBlock(), createElementBlock("a", {
                            key: 0,
                            role: "button",
                            onClick: withModifiers($event => ($options.toggleDetails(row)), ["stop"])
                          }, [
                            createVNode(_component_b_icon, {
                              icon: $props.detailIcon,
                              pack: $props.iconPack,
                              both: "",
                              class: normalizeClass({'is-expanded': $options.isVisibleDetailRow(row)})
                            }, null, 8 /* PROPS */, ["icon", "pack", "class"])
                          ], 8 /* PROPS */, _hoisted_19))
                        : createCommentVNode("v-if", true)
                    ]))
                  : createCommentVNode("v-if", true),
                ($props.checkable && $props.checkboxPosition === 'left')
                  ? (openBlock(), createElementBlock("td", {
                      key: 1,
                      class: normalizeClass(['checkbox-cell', { 'is-sticky': $props.stickyCheckbox } ])
                    }, [
                      createVNode(_component_b_checkbox, {
                        autocomplete: "off",
                        "model-value": $options.isRowChecked(row),
                        type: $props.checkboxType,
                        disabled: !$props.isRowCheckable(row),
                        onClick: withModifiers($event => ($options.checkRow(row, index, $event)), ["prevent","stop"])
                      }, null, 8 /* PROPS */, ["model-value", "type", "disabled", "onClick"])
                    ], 2 /* CLASS */))
                  : createCommentVNode("v-if", true),
                (openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleColumns, (column, colindex) => {
                  return (openBlock(), createElementBlock(Fragment, {
                    key: column.newKey + ':' + index + ':' + colindex
                  }, [
                    (column.$slots.default)
                      ? (openBlock(), createBlock(_component_b_slot_component, mergeProps({
                          key: 0,
                          component: column
                        }, column.tdAttrs(row, column), {
                          scoped: "",
                          name: "default",
                          tag: "td",
                          class: column.getRootClasses(row),
                          style: column.getRootStyle(row),
                          "data-label": column.label,
                          props: { row, column, index, colindex, toggleDetails: $options.toggleDetails },
                          onClick: $event => (_ctx.$emit('cellclick',row,column,index,colindex))
                        }), null, 16 /* FULL_PROPS */, ["component", "class", "style", "data-label", "props", "onClick"]))
                      : createCommentVNode("v-if", true)
                  ], 64 /* STABLE_FRAGMENT */))
                }), 128 /* KEYED_FRAGMENT */)),
                ($props.checkable && $props.checkboxPosition === 'right')
                  ? (openBlock(), createElementBlock("td", {
                      key: 2,
                      class: normalizeClass(['checkbox-cell', { 'is-sticky': $props.stickyCheckbox } ])
                    }, [
                      createVNode(_component_b_checkbox, {
                        autocomplete: "off",
                        "model-value": $options.isRowChecked(row),
                        type: $props.checkboxType,
                        disabled: !$props.isRowCheckable(row),
                        onClick: withModifiers($event => ($options.checkRow(row, index, $event)), ["prevent","stop"])
                      }, null, 8 /* PROPS */, ["model-value", "type", "disabled", "onClick"])
                    ], 2 /* CLASS */))
                  : createCommentVNode("v-if", true)
              ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_17),
              createVNode(Transition, { name: $props.detailTransition }, {
                default: withCtx(() => [
                  ($options.isActiveDetailRow(row))
                    ? (openBlock(), createElementBlock("tr", _hoisted_20, [
                        createElementVNode("td", { colspan: $options.columnCount }, [
                          createElementVNode("div", _hoisted_22, [
                            renderSlot(_ctx.$slots, "detail", {
                              row: row,
                              index: index
                            })
                          ])
                        ], 8 /* PROPS */, _hoisted_21)
                      ]))
                    : createCommentVNode("v-if", true)
                ]),
                _: 2 /* DYNAMIC */
              }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["name"]),
              ($options.isActiveCustomDetailRow(row))
                ? renderSlot(_ctx.$slots, "detail", {
                    key: 0,
                    row: row,
                    index: index
                  })
                : createCommentVNode("v-if", true)
            ], 64 /* STABLE_FRAGMENT */))
          }), 128 /* KEYED_FRAGMENT */)),
          (!$options.visibleData.length)
            ? (openBlock(), createElementBlock("tr", _hoisted_23, [
                createElementVNode("td", { colspan: $options.columnCount }, [
                  renderSlot(_ctx.$slots, "empty")
                ], 8 /* PROPS */, _hoisted_24)
              ]))
            : createCommentVNode("v-if", true)
        ]),
        (_ctx.$slots.footer !== undefined)
          ? (openBlock(), createElementBlock("tfoot", _hoisted_25, [
              createElementVNode("tr", _hoisted_26, [
                ($options.hasCustomFooterSlot())
                  ? renderSlot(_ctx.$slots, "footer", { key: 0 })
                  : (openBlock(), createElementBlock("th", {
                      key: 1,
                      colspan: $options.columnCount
                    }, [
                      renderSlot(_ctx.$slots, "footer")
                    ], 8 /* PROPS */, _hoisted_27))
              ])
            ]))
          : createCommentVNode("v-if", true)
      ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_2$4),
      ($props.loading)
        ? renderSlot(_ctx.$slots, "loading", { key: 0 }, () => [
            createVNode(_component_b_loading, {
              "is-full-page": false,
              "model-value": $props.loading
            }, null, 8 /* PROPS */, ["model-value"])
          ])
        : createCommentVNode("v-if", true)
    ], 6 /* CLASS, STYLE */),
    (($props.checkable && $options.hasBottomLeftSlot()) ||
                ($props.paginated && ($props.paginationPosition === 'bottom' || $props.paginationPosition === 'both')))
      ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
          createVNode(_component_b_table_pagination, mergeProps(_ctx.$attrs, {
            "per-page": $props.perPage,
            paginated: $props.paginated,
            rounded: $props.paginationRounded,
            "icon-pack": $props.iconPack,
            total: $data.newDataTotal,
            "current-page": $data.newCurrentPage,
            "onUpdate:currentPage": _cache[6] || (_cache[6] = $event => (($data.newCurrentPage) = $event)),
            "aria-next-label": $props.ariaNextLabel,
            "aria-previous-label": $props.ariaPreviousLabel,
            "aria-page-label": $props.ariaPageLabel,
            "aria-current-label": $props.ariaCurrentLabel,
            onPageChange: _cache[7] || (_cache[7] = (event) => _ctx.$emit('page-change', event)),
            "page-input": $props.pageInput,
            "pagination-order": $props.paginationOrder,
            "page-input-position": $props.pageInputPosition,
            "debounce-page-input": $props.debouncePageInput
          }), {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "bottom-left")
            ]),
            _: 3 /* FORWARDED */
          }, 16 /* FULL_PROPS */, ["per-page", "paginated", "rounded", "icon-pack", "total", "current-page", "aria-next-label", "aria-previous-label", "aria-page-label", "aria-current-label", "page-input", "pagination-order", "page-input-position", "debounce-page-input"])
        ])
      : createCommentVNode("v-if", true)
  ]))
}

script$7.render = render$6;
script$7.__file = "src/components/table/Table.vue";

var Plugin$e = {
  install: function install(Vue) {
    registerComponent(Vue, script$7);
    registerComponent(Vue, script$9);
  }
};
use(Plugin$e);
var Plugin$f = Plugin$e;

var script$6 = {
    name: 'BTabs',
    mixins: [TabbedMixin('tab')],
    props: {
        expanded: {
            type: Boolean,
            default: () => {
                return config.defaultTabsExpanded
            }
        },
        type: {
            type: [String, Object],
            default: () => {
                return config.defaultTabsType
            }
        },
        animated: {
            type: Boolean,
            default: () => {
                return config.defaultTabsAnimated
            }
        },
        multiline: Boolean
    },
    data() {
        return {
            currentFocus: null
        }
    },
    computed: {
        mainClasses() {
            return {
                'is-fullwidth': this.expanded,
                'is-vertical': this.vertical,
                'is-multiline': this.multiline,
                [this.position]: this.position && this.vertical
            }
        },
        navClasses() {
            return [
                this.type,
                this.size,
                {
                    [this.position]: this.position && !this.vertical,
                    'is-fullwidth': this.expanded,
                    'is-toggle': this.type === 'is-toggle-rounded'
                }
            ]
        }
    },
    methods: {
        giveFocusToTab(tab) {
            if (tab.$el && tab.$el.focus) {
                tab.$el.focus();
            } else if (tab.focus) {
                tab.focus();
            }
        },
        manageTablistKeydown(event) {
            // https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent/key/Key_Values#Navigation_keys
            const { key } = event;
            switch (key) {
                case this.vertical ? 'ArrowUp' : 'ArrowLeft':
                case this.vertical ? 'Up' : 'Left': {
                    let prevIdx = this.getPrevItemIdx(this.currentFocus, true);
                    if (prevIdx === null) {
                        // We try to give focus back to the last visible element
                        prevIdx = this.getPrevItemIdx(Infinity, true);
                    }
                    const prevItem = this.items.find((i) => i.index === prevIdx);
                    if (
                        prevItem &&
                        this.$refs[`tabLink${prevIdx}`] &&
                        !prevItem.disabled
                    ) {
                        this.giveFocusToTab(this.$refs[`tabLink${prevIdx}`]);
                    }
                    event.preventDefault();
                    break
                }
                case this.vertical ? 'ArrowDown' : 'ArrowRight':
                case this.vertical ? 'Down' : 'Right': {
                    let nextIdx = this.getNextItemIdx(this.currentFocus, true);
                    if (nextIdx === null) {
                        // We try to give focus back to the first visible element
                        nextIdx = this.getNextItemIdx(-1, true);
                    }
                    const nextItem = this.items.find((i) => i.index === nextIdx);
                    if (
                        nextItem &&
                        this.$refs[`tabLink${nextIdx}`] &&
                        !nextItem.disabled
                    ) {
                        this.giveFocusToTab(this.$refs[`tabLink${nextIdx}`]);
                    }
                    event.preventDefault();
                    break
                }
            }
        },

        manageTabKeydown(event, childItem) {
            // https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent/key/Key_Values#Navigation_keys
            const { key } = event;
            switch (key) {
                case ' ':
                case 'Space':
                case 'Spacebar':
                case 'Enter': {
                    this.childClick(childItem);
                    event.preventDefault();
                    break
                }
            }
        }
    }
};

const _hoisted_1$4 = ["aria-orientation"];
const _hoisted_2$3 = ["aria-controls", "aria-selected"];
const _hoisted_3$1 = ["id", "tabindex", "onFocus", "onClick", "onKeydown"];

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_slot_component = resolveComponent("b-slot-component");
  const _component_b_icon = resolveComponent("b-icon");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["b-tabs", $options.mainClasses])
  }, [
    createElementVNode("nav", {
      class: normalizeClass(["tabs", $options.navClasses]),
      onKeydown: _cache[0] || (_cache[0] = (...args) => ($options.manageTablistKeydown && $options.manageTablistKeydown(...args)))
    }, [
      renderSlot(_ctx.$slots, "start"),
      createElementVNode("ul", {
        "aria-orientation": _ctx.vertical ? 'vertical' : 'horizontal',
        role: "tablist"
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.items, (childItem) => {
          return withDirectives((openBlock(), createElementBlock("li", {
            key: childItem.value,
            class: normalizeClass([ childItem.headerClass, { 'is-active': childItem.isActive,
                                                       'is-disabled': childItem.disabled }]),
            role: "tab",
            "aria-controls": `${childItem.value}-content`,
            "aria-selected": `${childItem.isActive}`
          }, [
            (childItem.$slots.header)
              ? (openBlock(), createBlock(_component_b_slot_component, {
                  key: 0,
                  ref_for: true,
                  ref: `tabLink${childItem.index}`,
                  component: childItem,
                  name: "header",
                  tag: "a",
                  id: `${childItem.value}-label`,
                  tabindex: childItem.isActive ? 0 : -1,
                  onFocus: $event => ($data.currentFocus = childItem.index),
                  onClick: $event => (_ctx.childClick(childItem)),
                  onKeydown: $event => ($options.manageTabKeydown($event, childItem))
                }, null, 8 /* PROPS */, ["component", "id", "tabindex", "onFocus", "onClick", "onKeydown"]))
              : (openBlock(), createElementBlock("a", {
                  key: 1,
                  ref_for: true,
                  ref: `tabLink${childItem.index}`,
                  id: `${childItem.value}-label`,
                  tabindex: childItem.isActive ? 0 : -1,
                  onFocus: $event => ($data.currentFocus = childItem.index),
                  onClick: $event => (_ctx.childClick(childItem)),
                  onKeydown: $event => ($options.manageTabKeydown($event, childItem))
                }, [
                  (childItem.icon)
                    ? (openBlock(), createBlock(_component_b_icon, {
                        key: 0,
                        icon: childItem.icon,
                        pack: childItem.iconPack,
                        size: _ctx.size
                      }, null, 8 /* PROPS */, ["icon", "pack", "size"]))
                    : createCommentVNode("v-if", true),
                  createElementVNode("span", null, toDisplayString(childItem.label), 1 /* TEXT */)
                ], 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_3$1))
          ], 10 /* CLASS, PROPS */, _hoisted_2$3)), [
            [vShow, childItem.visible]
          ])
        }), 128 /* KEYED_FRAGMENT */))
      ], 8 /* PROPS */, _hoisted_1$4),
      renderSlot(_ctx.$slots, "end")
    ], 34 /* CLASS, HYDRATE_EVENTS */),
    createElementVNode("section", {
      class: normalizeClass(["tab-content", {'is-transitioning': _ctx.isTransitioning}])
    }, [
      renderSlot(_ctx.$slots, "default")
    ], 2 /* CLASS */)
  ], 2 /* CLASS */))
}

script$6.render = render$5;
script$6.__file = "src/components/tabs/Tabs.vue";

var script$5 = {
    name: 'BTabItem',
    mixins: [TabbedChildMixin('tab')],
    props: {
        disabled: Boolean
    },
    data() {
        return {
            elementClass: 'tab-item',
            elementRole: 'tabpanel'
        }
    }
};

script$5.__file = "src/components/tabs/TabItem.vue";

var Plugin$c = {
  install: function install(Vue) {
    registerComponent(Vue, script$6);
    registerComponent(Vue, script$5);
  }
};
use(Plugin$c);
var Plugin$d = Plugin$c;

var script$4 = {
    name: 'BTag',
    props: {
        attached: Boolean,
        closable: Boolean,
        type: String,
        size: String,
        rounded: Boolean,
        disabled: Boolean,
        ellipsis: Boolean,
        tabstop: {
            type: Boolean,
            default: true
        },
        ariaCloseLabel: String,
        icon: String,
        iconType: String,
        iconPack: String,
        closeType: String,
        closeIcon: String,
        closeIconPack: String,
        closeIconType: String
    },
    emits: ['click', 'close'],
    computed: {
        // setting a boolean attribute `false` does not remove it on Vue 3.
        // `null` or `undefined` has to be given to remove it.
        disabledOrUndefined() {
            return this.disabled || undefined
        }
    },
    methods: {
        /**
        * Emit close event when delete button is clicked
        * or delete key is pressed.
        */
        close(event) {
            if (this.disabled) return

            this.$emit('close', event);
        },
        /**
        * Emit click event when tag is clicked.
        */
        click(event) {
            if (this.disabled) return

            this.$emit('click', event);
        }
    }
};

const _hoisted_1$3 = {
  key: 0,
  class: "tags has-addons"
};
const _hoisted_2$2 = ["aria-label", "tabindex", "disabled"];
const _hoisted_3 = ["aria-label", "disabled", "tabindex"];

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_icon = resolveComponent("b-icon");

  return ($props.attached && $props.closable)
    ? (openBlock(), createElementBlock("div", _hoisted_1$3, [
        createElementVNode("span", {
          class: normalizeClass(["tag", [$props.type, $props.size, { 'is-rounded': $props.rounded }]])
        }, [
          ($props.icon)
            ? (openBlock(), createBlock(_component_b_icon, {
                key: 0,
                icon: $props.icon,
                size: $props.size,
                type: $props.iconType,
                pack: $props.iconPack
              }, null, 8 /* PROPS */, ["icon", "size", "type", "pack"]))
            : createCommentVNode("v-if", true),
          createElementVNode("span", {
            class: normalizeClass({ 'has-ellipsis': $props.ellipsis }),
            onClick: _cache[0] || (_cache[0] = (...args) => ($options.click && $options.click(...args)))
          }, [
            renderSlot(_ctx.$slots, "default")
          ], 2 /* CLASS */)
        ], 2 /* CLASS */),
        createElementVNode("a", {
          class: normalizeClass(["tag", [$props.size,
                     $props.closeType,
                     {'is-rounded': $props.rounded},
                     $props.closeIcon ? 'has-delete-icon' : 'is-delete']]),
          role: "button",
          "aria-label": $props.ariaCloseLabel,
          tabindex: $props.tabstop ? 0 : false,
          disabled: $options.disabledOrUndefined,
          onClick: _cache[1] || (_cache[1] = (...args) => ($options.close && $options.close(...args))),
          onKeyup: _cache[2] || (_cache[2] = withKeys(withModifiers((...args) => ($options.close && $options.close(...args)), ["prevent"]), ["delete"]))
        }, [
          ($props.closeIcon)
            ? (openBlock(), createBlock(_component_b_icon, {
                key: 0,
                "custom-class": "",
                icon: $props.closeIcon,
                size: $props.size,
                type: $props.closeIconType,
                pack: $props.closeIconPack
              }, null, 8 /* PROPS */, ["icon", "size", "type", "pack"]))
            : createCommentVNode("v-if", true)
        ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_2$2)
      ]))
    : (openBlock(), createElementBlock("span", {
        key: 1,
        class: normalizeClass(["tag", [$props.type, $props.size, { 'is-rounded': $props.rounded }]])
      }, [
        ($props.icon)
          ? (openBlock(), createBlock(_component_b_icon, {
              key: 0,
              icon: $props.icon,
              size: $props.size,
              type: $props.iconType,
              pack: $props.iconPack
            }, null, 8 /* PROPS */, ["icon", "size", "type", "pack"]))
          : createCommentVNode("v-if", true),
        createElementVNode("span", {
          class: normalizeClass({ 'has-ellipsis': $props.ellipsis }),
          onClick: _cache[3] || (_cache[3] = (...args) => ($options.click && $options.click(...args)))
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 2 /* CLASS */),
        ($props.closable)
          ? (openBlock(), createElementBlock("a", {
              key: 1,
              role: "button",
              "aria-label": $props.ariaCloseLabel,
              class: normalizeClass(["delete is-small", $props.closeType]),
              disabled: $options.disabledOrUndefined,
              tabindex: $props.tabstop ? 0 : false,
              onClick: _cache[4] || (_cache[4] = (...args) => ($options.close && $options.close(...args))),
              onKeyup: _cache[5] || (_cache[5] = withKeys(withModifiers((...args) => ($options.close && $options.close(...args)), ["prevent"]), ["delete"]))
            }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_3))
          : createCommentVNode("v-if", true)
      ], 2 /* CLASS */))
}

script$4.render = render$4;
script$4.__file = "src/components/tag/Tag.vue";

var script$3 = {
    name: 'BTaglist',
    props: {
        attached: Boolean
    }
};

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["tags", { 'has-addons': $props.attached }])
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 2 /* CLASS */))
}

script$3.render = render$3;
script$3.__file = "src/components/tag/Taglist.vue";

var Plugin$a = {
  install: function install(Vue) {
    registerComponent(Vue, script$4);
    registerComponent(Vue, script$3);
  }
};
use(Plugin$a);
var Plugin$b = Plugin$a;

var script$2 = {
    name: 'BTaginput',
    components: {
        [script$15.name]: script$15,
        [script$4.name]: script$4
    },
    mixins: [FormElementMixin],
    inheritAttrs: false,
    props: {
        modelValue: {
            type: Array,
            default: () => []
        },
        data: {
            type: Array,
            default: () => []
        },
        type: String,
        closeType: String,
        rounded: {
            type: Boolean,
            default: false
        },
        attached: {
            type: Boolean,
            default: false
        },
        maxtags: {
            type: [Number, String],
            required: false
        },
        hasCounter: {
            type: Boolean,
            default: () => config.defaultTaginputHasCounter
        },
        field: {
            type: String,
            default: 'value'
        },
        autocomplete: Boolean,
        groupField: String,
        groupOptions: String,
        nativeAutocomplete: String,
        openOnFocus: Boolean,
        keepOpen: {
            type: Boolean,
            default: true
        },
        keepFirst: Boolean,
        disabled: Boolean,
        ellipsis: Boolean,
        closable: {
            type: Boolean,
            default: true
        },
        ariaCloseLabel: String,
        confirmKeys: {
            type: Array,
            default: () => [',', 'Tab', 'Enter']
        },
        removeOnKeys: {
            type: Array,
            default: () => ['Backspace']
        },
        allowNew: Boolean,
        onPasteSeparators: {
            type: Array,
            default: () => [',']
        },
        beforeAdding: {
            type: Function,
            default: () => true
        },
        allowDuplicates: {
            type: Boolean,
            default: false
        },
        checkInfiniteScroll: {
            type: Boolean,
            default: false
        },
        createTag: {
            type: Function,
            default: (tag) => tag
        },
        appendToBody: Boolean
    },
    emits: [
        'add',
        'infinite-scroll',
        'remove',
        'typing',
        'update:modelValue'
    ],
    data() {
        return {
            tags: Array.isArray(this.modelValue)
                ? this.modelValue.slice(0)
                : (this.modelValue || []),
            newTag: '',
            isComposing: false,
            _elementRef: 'autocomplete',
            _isTaginput: true
        }
    },
    computed: {
        rootClasses() {
            return {
                'is-expanded': this.expanded
            }
        },

        containerClasses() {
            return {
                'is-focused': this.isFocused,
                'is-focusable': this.hasInput
            }
        },

        valueLength() {
            return this.newTag.trim().length
        },

        hasDefaultSlot() {
            return !!this.$slots.default
        },

        hasEmptySlot() {
            return !!this.$slots.empty
        },

        hasHeaderSlot() {
            return !!this.$slots.header
        },

        hasFooterSlot() {
            return !!this.$slots.footer
        },

        /**
         * Show the input field if a maxtags hasn't been set or reached.
         */
        hasInput() {
            return this.maxtags == null || this.maxtags === 1 || this.tagsLength < this.maxtags
        },

        tagsLength() {
            return this.tags.length
        },

        /**
         * If Taginput has onPasteSeparators prop,
         * returning new RegExp used to split pasted string.
         */
        separatorsAsRegExp() {
            const sep = this.onPasteSeparators;

            return sep.length
                ? new RegExp(sep.map((s) => {
                    return s ? s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : null
                }).join('|'), 'g')
                : null
        },

        disabledOrUndefined() {
            // On Vue 3, setting a boolean attribute `false` does not remove it.
            // `null` or `undefined` has to be given to remove it.
            return this.disabled || undefined
        }
    },
    watch: {
        /**
         * When v-model is changed set internal value.
         */
        modelValue(value) {
            this.tags = Array.isArray(value) ? value.slice(0) : (value || []);
        },

        hasInput() {
            if (!this.hasInput) this.onBlur();
        }
    },
    methods: {
        addTag(tag) {
            const tagToAdd = tag || this.newTag.trim();

            if (tagToAdd) {
                if (!this.autocomplete) {
                    const reg = this.separatorsAsRegExp;
                    if (reg && tagToAdd.match(reg)) {
                        tagToAdd.split(reg)
                            .map((t) => t.trim())
                            .filter((t) => t.length !== 0)
                            .map(this.addTag);
                        return
                    }
                }
                // Add the tag input if it is not blank
                // or previously added (if not allowDuplicates).
                const add = !this.allowDuplicates ? this.tags.indexOf(tagToAdd) === -1 : true;
                if (add && this.beforeAdding(tagToAdd)) {
                    if (this.maxtags === 1) {
                        this.tags = []; // replace existing tag if only 1 is allowed
                    }
                    this.tags.push(this.createTag(tagToAdd));
                    this.$emit('update:modelValue', this.tags);
                    this.$emit('add', tagToAdd);
                }

                // after autocomplete events
                requestAnimationFrame(() => {
                    this.newTag = '';
                    this.$emit('typing', '');
                });
            }
        },

        getNormalizedTagText(tag) {
            if (typeof tag === 'object') {
                tag = getValueByPath(tag, this.field);
            }

            return `${tag}`
        },

        customOnBlur(event) {
            // Add tag on-blur if not select only
            if (!this.autocomplete) this.addTag();

            this.onBlur(event);
        },

        onSelect(option) {
            if (!option) return

            this.addTag(option);
            this.$nextTick(() => {
                this.newTag = '';
            });
        },

        removeTag(index, event) {
            const tag = this.tags.splice(index, 1)[0];
            this.$emit('update:modelValue', this.tags);
            this.$emit('remove', tag);
            if (event) event.stopPropagation();
            if (this.openOnFocus && this.$refs.autocomplete) {
                this.$refs.autocomplete.focus();
            }
            return tag
        },

        removeLastTag() {
            if (this.tagsLength > 0) {
                this.removeTag(this.tagsLength - 1);
            }
        },

        keydown(event) {
            const { key } = event; // cannot destructure preventDefault (https://stackoverflow.com/a/49616808/2774496)
            if (this.removeOnKeys.indexOf(key) !== -1 && !this.newTag.length) {
                this.removeLastTag();
            }
            // Stop if is to accept select only
            if (this.autocomplete && !this.allowNew) return

            if (this.confirmKeys.indexOf(key) >= 0) {
                // Allow Tab to advance to next field regardless
                if (key !== 'Tab') event.preventDefault();
                if (key === 'Enter' && this.isComposing) return
                this.addTag();
            }
        },

        onTyping(event) {
            this.$emit('typing', event.trim());
        },

        emitInfiniteScroll() {
            this.$emit('infinite-scroll');
        }
    }
};

const _hoisted_1$2 = ["disabled"];
const _hoisted_2$1 = {
  key: 0,
  class: "help counter"
};

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_b_tag = resolveComponent("b-tag");
  const _component_b_autocomplete = resolveComponent("b-autocomplete");

  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["taginput control", $options.rootClasses])
  }, [
    createElementVNode("div", {
      class: normalizeClass(["taginput-container", [_ctx.statusType, _ctx.size, $options.containerClasses]]),
      disabled: $options.disabledOrUndefined,
      onClick: _cache[3] || (_cache[3] = $event => ($options.hasInput && _ctx.focus($event)))
    }, [
      renderSlot(_ctx.$slots, "selected", { tags: $data.tags }, () => [
        (openBlock(true), createElementBlock(Fragment, null, renderList($data.tags, (tag, index) => {
          return (openBlock(), createBlock(_component_b_tag, {
            key: $options.getNormalizedTagText(tag) + index,
            type: $props.type,
            "close-type": $props.closeType,
            size: _ctx.size,
            rounded: $props.rounded,
            attached: $props.attached,
            tabstop: false,
            disabled: $options.disabledOrUndefined,
            ellipsis: $props.ellipsis,
            closable: $props.closable,
            "aria-close-label": $props.ariaCloseLabel,
            title: $props.ellipsis && $options.getNormalizedTagText(tag),
            onClose: $event => ($options.removeTag(index, $event))
          }, {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "tag", { tag: tag }, () => [
                createTextVNode(toDisplayString($options.getNormalizedTagText(tag)), 1 /* TEXT */)
              ])
            ]),
            _: 2 /* DYNAMIC */
          }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["type", "close-type", "size", "rounded", "attached", "disabled", "ellipsis", "closable", "aria-close-label", "title", "onClose"]))
        }), 128 /* KEYED_FRAGMENT */))
      ]),
      ($options.hasInput)
        ? (openBlock(), createBlock(_component_b_autocomplete, mergeProps({
            key: 0,
            ref: "autocomplete",
            modelValue: $data.newTag,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($data.newTag) = $event))
          }, _ctx.$attrs, {
            data: $props.data,
            field: $props.field,
            icon: _ctx.icon,
            "icon-pack": _ctx.iconPack,
            maxlength: _ctx.maxlength,
            "has-counter": false,
            size: _ctx.size,
            disabled: $options.disabledOrUndefined,
            loading: _ctx.loading,
            autocomplete: $props.nativeAutocomplete,
            "open-on-focus": $props.openOnFocus,
            "keep-open": $props.keepOpen,
            "keep-first": $props.keepFirst,
            "group-field": $props.groupField,
            "group-options": $props.groupOptions,
            "use-html5-validation": _ctx.useHtml5Validation,
            "check-infinite-scroll": $props.checkInfiniteScroll,
            "append-to-body": $props.appendToBody,
            "confirm-keys": $props.confirmKeys,
            onTyping: $options.onTyping,
            onFocus: _ctx.onFocus,
            onBlur: $options.customOnBlur,
            onKeydown: $options.keydown,
            onCompositionstart: _cache[1] || (_cache[1] = $event => ($data.isComposing = true)),
            onCompositionend: _cache[2] || (_cache[2] = $event => ($data.isComposing = false)),
            onSelect: $options.onSelect,
            onInfiniteScroll: $options.emitInfiniteScroll
          }), createSlots({ _: 2 /* DYNAMIC */ }, [
            ($options.hasHeaderSlot)
              ? {
                  name: "header",
                  fn: withCtx(() => [
                    renderSlot(_ctx.$slots, "header")
                  ]),
                  key: "0"
                }
              : undefined,
            ($options.hasDefaultSlot)
              ? {
                  name: "default",
                  fn: withCtx((props) => [
                    renderSlot(_ctx.$slots, "default", {
                      option: props.option,
                      index: props.index
                    })
                  ]),
                  key: "1"
                }
              : undefined,
            ($options.hasEmptySlot)
              ? {
                  name: "empty",
                  fn: withCtx(() => [
                    renderSlot(_ctx.$slots, "empty")
                  ]),
                  key: "2"
                }
              : undefined,
            ($options.hasFooterSlot)
              ? {
                  name: "footer",
                  fn: withCtx(() => [
                    renderSlot(_ctx.$slots, "footer")
                  ]),
                  key: "3"
                }
              : undefined
          ]), 1040 /* FULL_PROPS, DYNAMIC_SLOTS */, ["modelValue", "data", "field", "icon", "icon-pack", "maxlength", "size", "disabled", "loading", "autocomplete", "open-on-focus", "keep-open", "keep-first", "group-field", "group-options", "use-html5-validation", "check-infinite-scroll", "append-to-body", "confirm-keys", "onTyping", "onFocus", "onBlur", "onKeydown", "onSelect", "onInfiniteScroll"]))
        : createCommentVNode("v-if", true)
    ], 10 /* CLASS, PROPS */, _hoisted_1$2),
    ($props.hasCounter && ($props.maxtags || _ctx.maxlength))
      ? (openBlock(), createElementBlock("small", _hoisted_2$1, [
          (_ctx.maxlength && $options.valueLength > 0)
            ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                createTextVNode(toDisplayString($options.valueLength) + " / " + toDisplayString(_ctx.maxlength), 1 /* TEXT */)
              ], 64 /* STABLE_FRAGMENT */))
            : ($props.maxtags)
              ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  createTextVNode(toDisplayString($options.tagsLength) + " / " + toDisplayString($props.maxtags), 1 /* TEXT */)
                ], 64 /* STABLE_FRAGMENT */))
              : createCommentVNode("v-if", true)
        ]))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$2.render = render$2;
script$2.__file = "src/components/taginput/Taginput.vue";

var Plugin$8 = {
  install: function install(Vue) {
    registerComponent(Vue, script$2);
  }
};
use(Plugin$8);
var Plugin$9 = Plugin$8;

var Plugin$6 = {
  install: function install(Vue) {
    registerComponent(Vue, script$G);
  }
};
use(Plugin$6);
var Plugin$7 = Plugin$6;

var script$1 = {
    name: 'BToast',
    mixins: [NoticeMixin],
    data() {
        return {
            newDuration: this.duration || config.defaultToastDuration
        }
    }
};

const _hoisted_1$1 = ["aria-hidden"];
const _hoisted_2 = ["innerHTML"];

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, {
    "enter-active-class": _ctx.transition.enter,
    "leave-active-class": _ctx.transition.leave,
    persisted: ""
  }, {
    default: withCtx(() => [
      withDirectives(createElementVNode("div", {
        onMouseenter: _cache[0] || (_cache[0] = (...args) => (_ctx.pause && _ctx.pause(...args))),
        onMouseleave: _cache[1] || (_cache[1] = (...args) => (_ctx.removePause && _ctx.removePause(...args))),
        class: normalizeClass(["toast", [_ctx.type, _ctx.position]]),
        "aria-hidden": !_ctx.isActive,
        role: "alert"
      }, [
        (_ctx.$slots.default)
          ? renderSlot(_ctx.$slots, "default", { key: 0 })
          : (openBlock(), createElementBlock("div", {
              key: 1,
              innerHTML: _ctx.message
            }, null, 8 /* PROPS */, _hoisted_2))
      ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_1$1), [
        [vShow, _ctx.isActive]
      ])
    ]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["enter-active-class", "leave-active-class"]))
}

script$1.render = render$1;
script$1.__file = "src/components/toast/Toast.vue";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var ToastProgrammatic = {
  open: function open(params) {
    if (typeof params === 'string') {
      params = {
        message: params
      };
    }
    var defaultParam = {
      position: config.defaultToastPosition || 'is-top'
    };
    if (params.parent) {
      delete params.parent;
    }
    var slot;
    if (Array.isArray(params.message)) {
      slot = params.message;
      delete params.message;
    }
    var propsData = merge(defaultParam, params);
    var container = document.createElement('div');
    var vueInstance = createApp({
      data: function data() {
        return {
          toastVNode: null
        };
      },
      methods: {
        close: function close() {
          var toast = getComponentFromVNode(this.toastVNode);
          if (toast) {
            toast.close();
          }
        }
      },
      render: function render() {
        this.toastVNode = h(script$1, _objectSpread(_objectSpread({}, propsData), {}, {
          // On Vue 3, $destroy is no longer available.
          // A toast has to be unmounted manually.
          onClose: function onClose() {
            if (typeof propsData.onClose === 'function') {
              propsData.onClose();
            }
            // timeout for the animation complete
            // before unmounting
            setTimeout(function () {
              vueInstance.unmount();
            }, 150);
          }
        }), slot != null ? {
          default: function _default() {
            return slot;
          }
        } : undefined);
        // we are interested in `toastVNode.component` but
        // at this point `toastVNode.component` should be null
        return this.toastVNode;
      }
    });
    // adds $buefy global property
    // so that $buefy.globalNoticeInterval is available on the new Vue app
    vueInstance.config.globalProperties.$buefy = {};
    return vueInstance.mount(container);
  }
};
var Plugin$4 = {
  install: function install(Vue) {
    registerComponentProgrammatic(Vue, 'toast', ToastProgrammatic);
  }
};
use(Plugin$4);
var Plugin$5 = Plugin$4;

var Plugin$2 = {
  install: function install(Vue) {
    registerComponent(Vue, script$N);
  }
};
use(Plugin$2);
var Plugin$3 = Plugin$2;

var script = {
    name: 'BUpload',
    mixins: [FormElementMixin],
    inheritAttrs: false,
    props: {
        modelValue: {
            type: [Object, Function, File, Array]
        },
        multiple: Boolean,
        disabled: Boolean,
        accept: String,
        dragDrop: Boolean,
        type: {
            type: String,
            default: 'is-primary'
        },
        native: {
            type: Boolean,
            default: false
        },
        expanded: {
            type: Boolean,
            default: false
        },
        rounded: {
            type: Boolean,
            default: false
        }
    },
    emits: ['invalid', 'update:modelValue'],
    data() {
        return {
            newValue: this.modelValue,
            dragDropFocus: false,
            _elementRef: 'input'
        }
    },
    computed: {
        classAndStyle() {
            return {
                class: this.$attrs.class,
                style: this.$attrs.style
            }
        },
        disabledOrUndefined() {
            // On Vue 3, setting a boolean attribute `false` does not remove it,
            // `true` or `undefined` has to be given to remove it.
            return this.disabled || undefined
        }
    },
    watch: {
        /**
         *   When v-model is changed:
         *   1. Set internal value.
         *   2. Reset internal input file value
         *   3. If it's invalid, validate again.
         */
        modelValue(value) {
            this.newValue = value;
            if (!value || (Array.isArray(value) && value.length === 0)) {
                this.$refs.input.value = null;
            }
            !this.isValid && !this.dragDrop && this.checkHtml5Validity();
        }
    },
    methods: {
        /**
        * Listen change event on input type 'file',
        * emit 'input' event and validate
        */
        onFileChange(event) {
            if (this.disabled || this.loading) return
            if (this.dragDrop) this.updateDragDropFocus(false);
            const value = event.target.files || event.dataTransfer.files;
            if (value.length === 0) {
                if (!this.newValue) return
                if (this.native) this.newValue = null;
            } else if (!this.multiple) {
                // only one element in case drag drop mode and isn't multiple
                if (this.dragDrop && value.length !== 1) return
                else {
                    const file = value[0];
                    if (this.checkType(file)) this.newValue = file;
                    else if (this.newValue) {
                        this.newValue = null;
                        this.clearInput();
                    } else {
                        // Force input back to empty state and recheck validity
                        this.clearInput();
                        this.checkHtml5Validity();
                        return
                    }
                }
            } else {
                // always new values if native or undefined local
                let newValues = false;
                if (this.native || !this.newValue) {
                    this.newValue = [];
                    newValues = true;
                }
                for (let i = 0; i < value.length; i++) {
                    const file = value[i];
                    if (this.checkType(file)) {
                        this.newValue.push(file);
                        newValues = true;
                    }
                }
                if (!newValues) return
            }
            this.$emit('update:modelValue', this.newValue);
            !this.dragDrop && this.checkHtml5Validity();
        },

        /*
        * Reset file input value
        */
        clearInput() {
            this.$refs.input.value = null;
        },

        /**
        * Listen drag-drop to update internal variable
        */
        updateDragDropFocus(focus) {
            if (!this.disabled && !this.loading) {
                this.dragDropFocus = focus;
            }
        },

        /**
        * Check mime type of file
        */
        checkType(file) {
            if (!this.accept) return true
            const types = this.accept.split(',');
            if (types.length === 0) return true
            let valid = false;
            for (let i = 0; i < types.length && !valid; i++) {
                const type = types[i].trim();
                if (type) {
                    if (type.substring(0, 1) === '.') {
                        // check extension
                        const extension = file.name.toLowerCase().slice(-type.length);
                        if (extension === type.toLowerCase()) {
                            valid = true;
                        }
                    } else {
                        // check mime type
                        if (file.type.match(type)) {
                            valid = true;
                        }
                    }
                }
            }
            if (!valid) this.$emit('invalid');
            return valid
        }
    }
};

const _hoisted_1 = ["multiple", "accept", "disabled"];

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("label", mergeProps({ class: "upload control" }, $options.classAndStyle, {
    class: [{'is-expanded' : $props.expanded, 'is-rounded' : $props.rounded}]
  }), [
    (!$props.dragDrop)
      ? renderSlot(_ctx.$slots, "default", { key: 0 })
      : (openBlock(), createElementBlock("div", {
          key: 1,
          class: normalizeClass(["upload-draggable", [$props.type, {
                'is-loading': _ctx.loading,
                'is-disabled': $props.disabled,
                'is-hovered': $data.dragDropFocus,
                'is-expanded': $props.expanded,
            }]]),
          onDragover: _cache[0] || (_cache[0] = withModifiers($event => ($options.updateDragDropFocus(true)), ["prevent"])),
          onDragleave: _cache[1] || (_cache[1] = withModifiers($event => ($options.updateDragDropFocus(false)), ["prevent"])),
          onDragenter: _cache[2] || (_cache[2] = withModifiers($event => ($options.updateDragDropFocus(true)), ["prevent"])),
          onDrop: _cache[3] || (_cache[3] = withModifiers((...args) => ($options.onFileChange && $options.onFileChange(...args)), ["prevent"]))
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 34 /* CLASS, HYDRATE_EVENTS */)),
    createElementVNode("input", mergeProps({
      ref: "input",
      type: "file"
    }, _ctx.$attrs, {
      multiple: $props.multiple,
      accept: $props.accept,
      disabled: $options.disabledOrUndefined,
      onChange: _cache[4] || (_cache[4] = (...args) => ($options.onFileChange && $options.onFileChange(...args)))
    }), null, 16 /* FULL_PROPS */, _hoisted_1)
  ], 16 /* FULL_PROPS */))
}

script.render = render;
script.__file = "src/components/upload/Upload.vue";

var Plugin = {
  install: function install(Vue) {
    registerComponent(Vue, script);
  }
};
use(Plugin);
var Plugin$1 = Plugin;

var components = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Autocomplete: Plugin$1j,
  Breadcrumb: Plugin$1h,
  Button: Plugin$1f,
  Carousel: Plugin$1d,
  Checkbox: Plugin$1b,
  Clockpicker: Plugin$17,
  Collapse: Plugin$19,
  Colorpicker: Plugin$15,
  Datepicker: Plugin$13,
  Datetimepicker: Plugin$11,
  Dialog: Plugin$$,
  Dropdown: Plugin$Z,
  Field: Plugin$X,
  Icon: Plugin$V,
  Image: Plugin$T,
  Input: Plugin$R,
  Loading: Plugin$P,
  Menu: Plugin$N,
  Message: Plugin$L,
  Modal: Plugin$J,
  Navbar: Plugin$F,
  Notification: Plugin$H,
  Numberinput: Plugin$D,
  Pagination: Plugin$B,
  Progress: Plugin$z,
  Radio: Plugin$x,
  Rate: Plugin$v,
  Select: Plugin$t,
  Skeleton: Plugin$r,
  Sidebar: Plugin$p,
  Slider: Plugin$n,
  Snackbar: Plugin$l,
  Steps: Plugin$j,
  Switch: Plugin$h,
  Table: Plugin$f,
  Tabs: Plugin$d,
  Tag: Plugin$b,
  Taginput: Plugin$9,
  Timepicker: Plugin$7,
  Toast: Plugin$5,
  Tooltip: Plugin$3,
  Upload: Plugin$1
});

var ConfigComponent = {
  getOptions: function getOptions() {
    return config;
  },
  setOptions: function setOptions$1(options) {
    setOptions(merge(config, options, true));
  }
};

var Buefy = {
  install: function install(Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // Options
    setOptions(merge(config, options, true));
    // Components
    for (var componentKey in components) {
      Vue.use(components[componentKey]);
    }
    // Config component
    registerComponentProgrammatic(Vue, 'config', ConfigComponent);
    Vue.config.globalProperties.$buefy.globalNoticeInterval = null;
  }
};
use(Buefy);

export { Plugin$1j as Autocomplete, Plugin$1h as Breadcrumb, Plugin$1f as Button, Plugin$1d as Carousel, Plugin$1b as Checkbox, Plugin$17 as Clockpicker, Plugin$19 as Collapse, Color$1 as Color, Plugin$15 as Colorpicker, ConfigComponent as ConfigProgrammatic, Plugin$13 as Datepicker, Plugin$11 as Datetimepicker, Plugin$$ as Dialog, DialogProgrammatic, Plugin$Z as Dropdown, Plugin$X as Field, Plugin$V as Icon, Plugin$T as Image, Plugin$R as Input, Plugin$P as Loading, LoadingProgrammatic, Plugin$N as Menu, Plugin$L as Message, Plugin$J as Modal, ModalProgrammatic, Plugin$F as Navbar, Plugin$H as Notification, NotificationProgrammatic, Plugin$D as Numberinput, Plugin$B as Pagination, Plugin$z as Progress, Plugin$x as Radio, Plugin$v as Rate, Plugin$t as Select, Plugin$p as Sidebar, Plugin$r as Skeleton, Plugin$n as Slider, Plugin$l as Snackbar, SnackbarProgrammatic, Plugin$j as Steps, Plugin$h as Switch, Plugin$f as Table, Plugin$d as Tabs, Plugin$b as Tag, Plugin$9 as Taginput, Plugin$7 as Timepicker, Plugin$5 as Toast, ToastProgrammatic, Plugin$3 as Tooltip, Plugin$1 as Upload, bound, createAbsoluteElement, createNewEvent, Buefy as default, escapeRegExpChars, getComponentFromVNode, getMonthNames, getValueByPath, getWeekdayNames, hasFlag, indexOf, isCustomElement, isDefined, isFragment, isMobile, isNil, isTag, isVueComponent, isWebpSupported, matchWithGroups, merge, mod, multiColumnSort, removeDiacriticsFromString, removeElement, sign, toCssWidth };
