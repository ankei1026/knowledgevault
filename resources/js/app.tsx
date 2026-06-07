// resources/js/app.tsx

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ) as any,
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#F9F8F6',
                            color: '#1A1A1A',
                            border: '1px solid #D4AF37',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            borderRadius: '0px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10B981',
                                secondary: '#F9F8F6',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#F9F8F6',
                            },
                        },
                    }}
                />
                <App {...props} />
            </>,
        );
    },
    progress: {
        color: '#D4AF37',
    },
});
