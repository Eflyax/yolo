import {createApp} from 'vue';
import App from './App.vue';
import 'splitpanes/dist/splitpanes.css';
import './styles/global.scss';
import Icon from './ui/components/Icon.vue';

const
	app = createApp(App);

app.component('Icon', Icon);

app.mount('#app');
