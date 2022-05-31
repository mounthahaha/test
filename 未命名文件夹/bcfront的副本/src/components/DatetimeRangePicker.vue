<template>
  <div class="el-datetime-range-picker">
    <el-date-picker
      v-model="date"
      :picker-options="datePickerOptions"
      class="el-vuetify-text-field"
      :type="type"
      :range-separator="$t(rangeSeparator)"
      :start-placeholder="$t(startPlaceholder)"
      :end-placeholder="$t(endPlaceholder)"
      value-format="yyyy-MM-dd HH:mm:ss"
      style="width: 100%"
      :disabled="disabled"
      :required="required"
      :style="`width: ${width}`"
      @pick="pickedDate"
    >
    </el-date-picker>
  </div>
</template>

<script>
import { shortcuts } from '@/utils';
import { formatDate } from '@/filters/custom';
let $t;
export default {
  name: 'DatetimeRangePicker',
  props: {
    // Take start and end as the input. Passable via v-model.
    value: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    rangeSeparator: {
      type: String,
      default: () => 'g_datePick_to',
    },
    startPlaceholder: {
      type: String,
      default: () => 'g_datePick_startTime',
    },
    endPlaceholder: {
      type: String,
      default: () => 'g_datePick_endTime',
    },
    type: {
      type: String,
      default: () => 'datetimerange',
    },
    width: {
      type: String,
      default: () => '100%',
    },
  },
  data() {
    return {
      datePickerOptions: {
        shortcuts,
        onPick: this.pickedDate,
      },
    };
  },
  computed: {
    date: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  watch: {
    value(val) {
      if (val && val.length) {
        const d = new Date(val[0]);
        val[0] == val[1] && (val[1] = formatDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)));
      }
    },
  },
  methods: {
    pickedDate(picked, $e, $t) {
      if (picked.maxDate && this.type == 'datetimerange') {
        picked.maxDate.setHours(23);
        picked.maxDate.setMinutes(59);
        picked.maxDate.setSeconds(59);
      }
    },
  },
};
</script>
