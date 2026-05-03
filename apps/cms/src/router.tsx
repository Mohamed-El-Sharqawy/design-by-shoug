import { createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import {
  LoginPage,
  DashboardPage,
  ProductsPage,
  ProductFormPage,
  CollectionsPage,
  OrdersPage,
  BannersPage,
  InstagramPage,
  VideosPage,
  FeaturedPage,
  CouponsPage,
  ShippingPage,
  ColorsPage,
  AbayaLengthsPage,
  BodySizesPage,
  CustomerReviewsPage,
} from '@/pages'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/new',
        element: <ProductFormPage />,
      },
      {
        path: 'products/:id',
        element: <ProductFormPage />,
      },
      {
        path: 'collections',
        element: <CollectionsPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'banners',
        element: <BannersPage />,
      },
      {
        path: 'instagram',
        element: <InstagramPage />,
      },
      {
        path: 'videos',
        element: <VideosPage />,
      },
      {
        path: 'featured',
        element: <FeaturedPage />,
      },
      {
        path: 'coupons',
        element: <CouponsPage />,
      },
      {
        path: 'shipping',
        element: <ShippingPage />,
      },
      {
        path: 'colors',
        element: <ColorsPage />,
      },
      {
        path: 'abaya-lengths',
        element: <AbayaLengthsPage />,
      },
      {
        path: 'body-sizes',
        element: <BodySizesPage />,
      },
      {
        path: 'customer-reviews',
        element: <CustomerReviewsPage />,
      },
    ],
  },
])
