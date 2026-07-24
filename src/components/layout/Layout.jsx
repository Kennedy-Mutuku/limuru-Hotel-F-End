import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
    return (
        <>
            <Header />
            <main style={{ marginTop: 'var(--header-h, 125px)' }}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
