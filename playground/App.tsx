import {toast, ToastRegion} from '../src/index';

import '../src/styles.css';

export default function App() {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-100">
			<h1 className="mb-4 text-2xl font-bold">@selvklart/toast</h1>

			<div className="flex flex-wrap justify-center gap-3">
				<button
					className="rounded bg-green-600 px-4 py-2 text-white"
					onClick={() =>
						toast.success('Saved successfully', {
							description: 'Your changes have been saved.',
						})
					}
				>
					Success
				</button>
				<button
					className="rounded bg-red-600 px-4 py-2 text-white"
					onClick={() =>
						toast.error('Something went wrong', {timeout: false})
					}
				>
					Error (persistent)
				</button>
				<button
					className="rounded bg-blue-600 px-4 py-2 text-white"
					onClick={() =>
						toast.info('New update available', {
							action: {
								label: 'Refresh',
								onClick: () => window.location.reload(),
							},
						})
					}
				>
					Info with action
				</button>
				<button
					className="rounded bg-amber-500 px-4 py-2 text-white"
					onClick={() => toast.warning('Unsaved changes')}
				>
					Warning
				</button>
			</div>

			<ToastRegion />
		</div>
	);
}
