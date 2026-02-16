import { MdConstruction } from 'react-icons/md';

interface PlaceholderProps {
  title: string;
  description?: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="p-4 lg:p-8 bg-[#fafafa] min-h-screen">
      <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-brand-text mb-2">
        {title}
      </h1>
      {description && <p className="text-brand-muted text-sm lg:text-base">{description}</p>}
      <div className="mt-6 lg:mt-8 bg-white rounded-2xl p-6 lg:p-8 text-center border border-gray-100">
        <MdConstruction className="text-5xl lg:text-6xl text-[#9B563A] mx-auto mb-4" />
        <h2 className="text-lg lg:text-xl font-serif font-semibold text-brand-text mb-2">
          Coming Soon
        </h2>
        <p className="text-brand-muted text-sm lg:text-base">This section is under development</p>
      </div>
    </div>
  );
}
