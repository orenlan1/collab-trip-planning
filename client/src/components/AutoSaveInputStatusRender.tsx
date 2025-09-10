import { IoCheckmarkCircleOutline, IoSaveOutline } from "react-icons/io5";


interface AutoSaveInputStatusRenderProps {
    saveState: 'idle' | 'saving' | 'saved';
    hasUnsavedChanges: boolean;
}


export const AutoSaveInputStatusRender = ({ saveState, hasUnsavedChanges }: AutoSaveInputStatusRenderProps) => {
    switch (saveState) {
        case 'saving':
            return (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <IoSaveOutline className="animate-pulse" />
                    <span>Saving...</span>
                </div>
            );
        case 'saved':
            return (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                    <IoCheckmarkCircleOutline />
                    <span>Saved</span>
                </div>
            );
        case 'idle':
            return hasUnsavedChanges ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <IoSaveOutline />
                    <span>Unsaved changes</span>
                </div>
            ) : null;
        default:
            return null;
    }
};