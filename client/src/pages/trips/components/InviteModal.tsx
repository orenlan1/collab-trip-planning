import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

export function InviteModal({ isOpen, onClose, tripId }: InviteModalProps) {
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const generateInviteLink = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/trips/invite/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Add this line to include authentication cookies
        body: JSON.stringify({ tripId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite link');
      }

      const data = await response.json();
      setInviteUrl(data.inviteUrl);
    } catch (error) {
      console.error('Error generating invite link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Invite Participants
                </Dialog.Title>
                <div className="space-y-4">
                  {!inviteUrl ? (
                    <button
                      onClick={generateInviteLink}
                      disabled={isLoading}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                    >
                      {isLoading ? 'Generating...' : 'Generate Invite Link'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value={inviteUrl}
                          className="flex-1 px-3 py-2 border rounded-md text-sm"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="p-2 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          {isCopied ? (
                            <FaCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <FaCopy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        This link will expire in 72 hours. Anyone with this link can join the trip.
                      </p>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

}
