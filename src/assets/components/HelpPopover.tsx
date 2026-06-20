import {useState} from "preact/hooks";
import {
    FloatingFocusManager,
    FloatingOverlay,
    useDismiss,
    useFloating,
    useInteractions,
    useRole
} from "@floating-ui/react";
import {createPortal} from "preact/compat";

export default function HelpDialog() {
    const [open, setOpen] = useState(false)

    const { refs, context } = useFloating({
        open,
        onOpenChange: setOpen
    })

    const dismiss = useDismiss(context)
    const role = useRole(context)

    const { getFloatingProps } = useInteractions([dismiss, role])

    return (
        <>
            {/* Trigger */}
            <button
                onClick={() => setOpen(true)}
                class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
                Help
            </button>

            {/* Modal */}
            {open &&
                createPortal(
                    <FloatingOverlay
                        lockScroll
                        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]"
                    >
                        <FloatingFocusManager context={context}>
                            <div
                                ref={refs.setFloating}
                                {...getFloatingProps()}
                                class="w-[360px] max-w-[90vw] rounded-xl bg-white shadow-2xl overflow-hidden"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="help-title"
                            >
                                {/* Header */}
                                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                    <h2 id="help-title" class="text-lg font-semibold">
                                        Help
                                    </h2>

                                    <button
                                        onClick={() => setOpen(false)}
                                        class="text-gray-500 hover:text-black text-xl leading-none"
                                        aria-label="Close modal"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Content */}
                                <div class="p-4 text-sm text-gray-700 space-y-3">
                                    <p>
                                        You can search for drinking water around you in a 2km area
                                        using the arrow icon, or search around another location by
                                        centering the map and clicking the magnifying glass icon.
                                    </p>

                                    <hr class="border-gray-200" />

                                    <p>
                                        Source code available on{' '}
                                        <a
                                            href="https://github.com/rogama25/drinking-water-explorer"
                                            class="text-blue-600 hover:underline"
                                            target="_blank"
                                        >
                                            GitHub
                                        </a>.
                                    </p>
                                </div>
                            </div>
                        </FloatingFocusManager>
                    </FloatingOverlay>,
                    document.body
                )}
        </>
    )
}