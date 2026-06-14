import SectionTitle from "./SectionTitle";
import Reveal from "./Reveal";

interface Props {
    id: string;
    title: string;
    description: string;
}

const Section: React.FC<React.PropsWithChildren<Props>> = ({ id, title, description, children }: React.PropsWithChildren<Props>) => {
    return (
        <section id={id} className="section-anchor pb-10 pt-12 lg:pb-20 lg:pt-16">
            <Reveal>
                <SectionTitle>
                    <h2 className="text-center mb-4">{title}</h2>
                </SectionTitle>
                <p className="mx-auto mb-12 max-w-3xl text-center text-muted">{description}</p>
            </Reveal>
            {children}
        </section>
    )
}

export default Section
