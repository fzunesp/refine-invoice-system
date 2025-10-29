import { Refine, Authenticated } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
  AuthPage,
} from "@refinedev/antd";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
  CatchAllNavigate,
} from "@refinedev/react-router-v6";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import PocketBase from "pocketbase";
import { dataProvider, liveProvider, authProvider } from "refine-pocketbase";

import "@refinedev/antd/dist/reset.css";

// Import pages
import { CustomerList, CustomerCreate, CustomerEdit } from "./pages/customers";
import { InvoiceList, InvoiceCreate, InvoiceEdit } from "./pages/invoices";
import { Dashboard } from "./pages/dashboard";

// Initialize Pocketbase client
const pb = new PocketBase("http://127.0.0.1:8090");

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(pb)}
            liveProvider={liveProvider(pb)}
            authProvider={authProvider(pb)}
            notificationProvider={useNotificationProvider}
            routerProvider={routerBindings}
            resources={[
              {
                name: "dashboard",
                list: "/",
                meta: {
                  label: "Dashboard",
                },
              },
              {
                name: "customers",
                list: "/customers",
                create: "/customers/create",
                edit: "/customers/edit/:id",
                meta: {
                  canDelete: true,
                },
              },
              {
                name: "invoices",
                list: "/invoices",
                create: "/invoices/create",
                edit: "/invoices/edit/:id",
                meta: {
                  canDelete: true,
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              liveMode: "auto",
            }}
          >
            <Routes>
              {/* Auth routes - must come first */}
              <Route
                element={
                  <Authenticated
                    key="authenticated-inner"
                    fallback={<Outlet />}
                  >
                    <CatchAllNavigate to="/" />
                  </Authenticated>
                }
              >
                <Route
                  path="/login"
                  element={
                    <AuthPage
                      type="login"
                      formProps={{
                        initialValues: {
                          email: "test@example.com",
                          password: "test123456",
                        },
                      }}
                    />
                  }
                />
                <Route path="/register" element={<AuthPage type="register" />} />
                <Route
                  path="/forgot-password"
                  element={<AuthPage type="forgotPassword" />}
                />
              </Route>

              {/* Protected routes */}
              <Route
                element={
                  <Authenticated
                    key="authenticated-outer"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayoutV2
                      Sider={() => (
                        <ThemedSiderV2
                          Title={() => (
                            <div
                              style={{
                                padding: "12px",
                                fontSize: "18px",
                                fontWeight: "bold",
                              }}
                            >
                              Invoice Manager
                            </div>
                          )}
                        />
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<Dashboard />} />

                {/* Customer Routes */}
                <Route path="/customers">
                  <Route index element={<CustomerList />} />
                  <Route path="create" element={<CustomerCreate />} />
                  <Route path="edit/:id" element={<CustomerEdit />} />
                </Route>

                {/* Invoice Routes */}
                <Route path="/invoices">
                  <Route index element={<InvoiceList />} />
                  <Route path="create" element={<InvoiceCreate />} />
                  <Route path="edit/:id" element={<InvoiceEdit />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>

            <RefineKbar />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;