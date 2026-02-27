import {createApp} from 'vue';
import App from './App.vue';
import 'splitpanes/dist/splitpanes.css';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import './styles/global.scss';
import Icon from './ui/components/Icon.vue';
import ContextMenu from '@imengyu/vue3-context-menu';

const
	app = createApp(App);

app.component('Icon', Icon);
app.use(ContextMenu);

app.mount('#app');
