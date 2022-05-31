export default {
  data() {
    return {
      valid: false,
      field: {},
      loading: false, // post put 請求用
      fetchLoading: false, // get api 載入用
      rules: {
        required: value => !!value || this.$t('g_text_rules_required'),
        emptyCheck: val => (val !== '' && val !== null) || this.$t('g_text_rules_required'),
        numberCheck: val => !isNaN(Number(val)) || this.$t('g_text_rules_must_number'),
        positiveInteger: val => /^[0-9]*[1-9][0-9]*$/.test(val) || val === '' || val === null || this.$t('g_text_rules_must_positive_integer'),
        positiveFloat: val =>
          /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/.test(val) || this.$t('g_text_rules_must_positive'),
      },
    };
  },
  model: {
    prop: 'active',
    event: 'update',
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => {},
    },
    options: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    model: {
      get() {
        return this.active;
      },
      set(value) {
        if (typeof value === 'boolean') {
          this.$emit('update', value);
        }
      },
    },
    isInsert() {
      return _.isEmpty(this.item);
    },
  },
  methods: {
    init() {},
    submit() {},
    closeDialog() {
      this.$emit('close');
      this.model = false;
    },
    updateDialog(refresh = false) {
      this.$emit('update', { refresh });
      this.closeDialog();
    },
  },
};
