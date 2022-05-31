
import styles from './styles.module.scss';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Advice from "@/components/Advice";

const PageLayout = props => {
    return (
        <>
            <NavBar />
            <div className={styles.mainWrap}>
                {props.children}
            </div>
            <Footer></Footer>
            <Advice />
        </>
    );
};

export default PageLayout;
