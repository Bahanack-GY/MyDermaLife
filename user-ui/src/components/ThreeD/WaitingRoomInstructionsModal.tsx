
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MousePointer2, Keyboard, Video } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

interface WaitingRoomInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitingRoomInstructionsModal({ isOpen, onClose }: WaitingRoomInstructionsModalProps) {
  const { t } = useTranslation();
  return (
    <Transition show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/70 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-light">
                    <Video className="h-6 w-6 text-brand-default" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-brand-text">
                      {t('waitingRoom.title')}
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-3 text-left bg-brand-light/30 p-3 rounded-lg">
                        <Keyboard className="h-5 w-5 text-brand-muted shrink-0" />
                        <p className="text-sm text-brand-text">
                          <Trans i18nKey="waitingRoom.move">
                              Use <strong>W, A, S, D</strong> or <strong>Arrow Keys</strong> to move around the room.
                          </Trans>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 text-left bg-brand-light/30 p-3 rounded-lg">
                        <MousePointer2 className="h-5 w-5 text-brand-muted shrink-0" />
                        <p className="text-sm text-brand-text">
                          <Trans i18nKey="waitingRoom.look">
                              Use your <strong>Mouse</strong> to look around.
                          </Trans>
                        </p>
                      </div>

                      <p className="text-sm text-brand-muted mt-4">
                        {t('waitingRoom.wait')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-brand-default px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-default"
                    onClick={onClose}
                  >
                    {t('waitingRoom.button')}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
