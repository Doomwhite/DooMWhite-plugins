/* eslint-disable @typescript-eslint/no-explicit-any */

export function restorePrototypes<T extends object>(
	target: T | null | undefined,
	defaultInstance: T,
): T {
	// If the target is null or undefined, fallback to a cloned defaultInstance
	if (target == null) {
		return defaultInstance; // You can use a deep clone utility if needed.
	}

	// Iterate through the keys of the default instance
	return Object.keys(defaultInstance).reduce(
		(result, key) => {
			const defaultValue = (defaultInstance as any)[key];
			const rawValue = (target as any)[key];

			// Check if the default value is an object and not an array
			if (
				defaultValue instanceof Object &&
				!(defaultValue instanceof Array)
			) {
				(result as any)[key] = restorePrototypes(
					rawValue,
					defaultValue,
				); // Recursively restore prototypes
			} else {
				(result as any)[key] =
					rawValue !== undefined ? rawValue : defaultValue; // Use rawValue or defaultValue
			}

			return result;
		},
		Object.create(Object.getPrototypeOf(defaultInstance)),
	); // Preserve prototype of defaultInstance
}
