import { useState, useRef } from 'react';
import { X, Upload, Calendar as CalendarIcon, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photoData: any) => void;
}

export function AddPhotoModal({ isOpen, onClose, onSave }: AddPhotoModalProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      title,
      notes,
      img: imagePreview
    });
    onClose();
    // Reset form
    setTitle('');
    setNotes('');
    setImagePreview(null);
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-brand-soft/50 flex items-center justify-between bg-brand-light/30">
          <div>
              <h3 className="text-lg font-serif font-semibold text-brand-dark flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-default" />
                Add New Photo
              </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Patient Photo</label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed border-brand-soft rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group",
                        imagePreview ? "border-brand-default bg-brand-light/10" : "hover:border-brand-default hover:bg-brand-light/5"
                    )}
                >
                    {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-medium text-sm flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> Change Photo
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-default mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-brand-dark">Click to upload image</p>
                            <p className="text-xs text-brand-muted mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </>
                    )}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                     <label className="block text-sm font-medium text-brand-dark mb-1">Date</label>
                     <div className="relative">
                         <input 
                            type="date" 
                            required
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                         />
                         <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                     </div>
                </div>
                
                {/* Title */}
                <div>
                     <label className="block text-sm font-medium text-brand-dark mb-1">Entry Title</label>
                     <input 
                        type="text" 
                        required
                        placeholder="e.g. Check-up"
                        className="w-full px-3 py-2 rounded-lg border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                     />
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Clinical Notes</label>
                <textarea 
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default resize-none"
                    placeholder="Describe observations, progress, or concerns..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-3">
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-brand-muted font-medium hover:text-brand-dark transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="px-6 py-2 bg-brand-default text-white rounded-lg font-medium hover:bg-brand-dark transition-colors shadow-lg shadow-brand-default/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!imagePreview || !title}
                >
                    Save Entry
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
