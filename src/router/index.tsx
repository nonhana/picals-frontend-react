import type { RouteObject } from 'react-router'
import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import App from '@/app'
import PersonalCenter from '@/pages/personal-center'

import AuthRouter from './utils/auth-router'
import AutoTop from './utils/auto-top'
import LazyLoad from './utils/lazy-load'
import PersonalPage from './utils/personal-page'

const routeList: RouteObject[] = [
  {
    path: '/',
    element: (
      <AutoTop>
        <App />
      </AutoTop>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'login',
        element: LazyLoad(lazy(() => import('@/pages/login'))),
      },
      {
        path: 'home',
        element: LazyLoad(lazy(() => import('@/pages/home'))),
      },
      {
        path: 'followed-new',
        element: <AuthRouter>{LazyLoad(lazy(() => import('@/pages/followed-new')))}</AuthRouter>,
      },
      {
        path: 'explore',
        element: <Navigate to="recommend" replace />,
      },
      {
        path: 'explore/:type',
        element: LazyLoad(lazy(() => import('@/pages/explore'))),
      },
      {
        path: 'search-result',
        element: LazyLoad(lazy(() => import('@/pages/search-result'))),
      },
      {
        path: 'work-detail/:workId',
        element: LazyLoad(lazy(() => import('@/pages/work-detail'))),
      },
      {
        path: 'illustrator/:illustratorId',
        element: LazyLoad(lazy(() => import('@/pages/illustrator'))),
      },
      {
        path: 'upload',
        element: <AuthRouter>{LazyLoad(lazy(() => import('@/pages/upload')))}</AuthRouter>,
      },
      {
        path: 'personal-center/:userId',
        element: <Navigate to="works" replace />,
      },
      {
        path: 'personal-center/:userId',
        element: <PersonalCenter />,
        children: [
          {
            path: 'works',
            element: LazyLoad(lazy(() => import('@/pages/personal-center/my-works'))),
          },
          {
            path: 'likes',
            element: LazyLoad(lazy(() => import('@/pages/personal-center/my-likes'))),
          },
          {
            path: 'favorites',
            element: LazyLoad(lazy(() => import('@/pages/personal-center/my-favorites'))),
          },
          {
            path: 'follow',
            element: LazyLoad(lazy(() => import('@/pages/personal-center/my-follow'))),
          },
          {
            path: 'fans',
            element: LazyLoad(lazy(() => import('@/pages/personal-center/my-fans'))),
          },
          {
            path: 'history',
            element: (
              <PersonalPage>
                {LazyLoad(lazy(() => import('@/pages/personal-center/my-history')))}
              </PersonalPage>
            ),
          },
        ],
      },
      {
        path: '/not-found',
        element: LazyLoad(lazy(() => import('@/pages/not-found'))),
      },
      {
        path: '*',
        element: <Navigate to="/not-found" replace />,
      },
    ],
  },
]

const router = createBrowserRouter(routeList)

export default router
