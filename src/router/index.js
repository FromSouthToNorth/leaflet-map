import {createWebHistory, createRouter} from 'vue-router'
import Home from '@/views/map/index.vue'

export const constantRoutes = [
    {
        path: '/',
        component: Home,
        hidden: true
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        else {
            return {top: 0}
        }
    },
});

export default router;
