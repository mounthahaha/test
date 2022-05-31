import Vue from 'vue';
// import '../theme/index.css';
import {
  DatePicker,
  Dialog,
  Button,
  Loading,
  Row,
  Col,
  Icon,
  Tooltip,
  Popover,
  Table,
  TableColumn,
  Carousel,
  CarouselItem,
  Pagination,
  Input,
  Form,
  FormItem,
  Select,
  Option,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  TimePicker,
  Tag,
  MessageBox,
  Switch,
  TimeSelect,
  RadioGroup,
  Radio,
  Image,
  Message,
  Upload,
} from 'element-ui';

Vue.use(DatePicker);
Vue.use(TimePicker);
Vue.use(Dialog);
Vue.use(Button);
Vue.use(Loading);
Vue.use(Row);
Vue.use(Col);
Vue.use(Icon);
Vue.use(Tooltip);
Vue.use(Popover);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Carousel);
Vue.use(CarouselItem);
Vue.use(Pagination);
Vue.use(Input);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Select);
Vue.use(Option);
Vue.use(Checkbox);
Vue.use(CheckboxButton);
Vue.use(CheckboxGroup);
Vue.use(Tag);
Vue.use(Switch);
Vue.use(TimeSelect);
Vue.use(RadioGroup);
Vue.use(Radio);
Vue.use(Image);
Vue.use(Upload);
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$message = Message
