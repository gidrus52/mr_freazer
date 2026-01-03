import {RouteRecordRaw, createWebHistory, createRouter} from "vue-router";
import  AppView from "./view/AppView/AppView"
import MainView from "./view/MainView/MainView"
import ProductionView from "./view/ProductionView/ProductionView"
import AdminView from "./view/AdminView/AdminView"
import { isAuthenticated } from "./utils/api"

const routes : RouteRecordRaw[] = [
     {
        name: "Main",
        path: "/",
        component: MainView
    },
     {
        name: "Production",
        path: "/production",
        component: ProductionView
    },
    {
        name: "App",
        path: "/app",
        component: AppView
    },
    {
        name: "Admin",
        path: "/admin",
        component: AdminView,
        beforeEnter: (to, from, next) => {
            if (isAuthenticated()) {
                next()
            } else {
                next('/')
            }
        }
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})



