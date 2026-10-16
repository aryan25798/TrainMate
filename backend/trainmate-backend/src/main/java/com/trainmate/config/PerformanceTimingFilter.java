package com.trainmate.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Enterprise Performance Timing Filter.
 * Appends standard W3C Server-Timing header (dur in milliseconds) to all API responses,
 * allowing browser developer tools, client telemetry, and performance monitors to measure
 * exact backend processing time separate from cloud network transit and DNS latency.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PerformanceTimingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(PerformanceTimingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        long startTime = System.nanoTime();

        try {
            chain.doFilter(request, response);
        } finally {
            long durationNs = System.nanoTime() - startTime;
            double durationMs = durationNs / 1_000_000.0;

            if (response instanceof HttpServletResponse httpResponse) {
                httpResponse.setHeader("Server-Timing", String.format("app;dur=%.2f", durationMs));
            }

            if (request instanceof HttpServletRequest httpRequest) {
                // Log slow requests (> 1 second) for observability without spamming logs
                if (durationMs > 1000.0 && !httpRequest.getRequestURI().contains("/actuator")) {
                    log.warn("Slow request detected: {} {} took {:.2f}ms",
                            httpRequest.getMethod(), httpRequest.getRequestURI(), durationMs);
                }
            }
        }
    }
}
