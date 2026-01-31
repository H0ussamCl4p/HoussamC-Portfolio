"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { routes, protectedRoutes } from "@/resources";
import { Flex, Spinner, Button, Heading, Column, PasswordInput } from "@once-ui-system/core";
import NotFound from "@/app/not-found";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const normalizedPathname = pathname || "/";
  const isHome = normalizedPathname === "/";

  const isRouteEnabled = (() => {
    if (normalizedPathname in routes) {
      return routes[normalizedPathname as keyof typeof routes];
    }

    const dynamicRoutes = ["/blog", "/work"] as const;
    for (const route of dynamicRoutes) {
      if (normalizedPathname.startsWith(route) && routes[route]) {
        return true;
      }
    }

    return false;
  })();

  const isPasswordRequired = Boolean(
    protectedRoutes[normalizedPathname as keyof typeof protectedRoutes]
  );

  // Avoid SSR/edge returning 404 due to client-side route gating.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (isHome) {
        setIsAuthenticated(true);
        setCheckingAuth(false);
        return;
      }

      if (!isPasswordRequired) {
        setIsAuthenticated(true);
        setCheckingAuth(false);
        return;
      }

      setCheckingAuth(true);
      setIsAuthenticated(false);

      try {
        const response = await fetch("/api/check-auth", { cache: "no-store" });
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [isHome, isPasswordRequired, normalizedPathname]);

  if (!mounted) {
    return <>{children}</>;
  }

  const handlePasswordSubmit = async () => {
    const response = await fetch("/api/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      setError(undefined);
    } else {
      setError("Incorrect password");
    }
  };

  if (checkingAuth) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (isHome) {
    return <>{children}</>;
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  if (isPasswordRequired && !isAuthenticated) {
    return (
      <Column paddingY="128" maxWidth={24} gap="24" center>
        <Heading align="center" wrap="balance">
          This page is password protected
        </Heading>
        <Column fillWidth gap="8" horizontal="center">
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={error}
          />
          <Button onClick={handlePasswordSubmit}>Submit</Button>
        </Column>
      </Column>
    );
  }

  return <>{children}</>;
};

export { RouteGuard };
