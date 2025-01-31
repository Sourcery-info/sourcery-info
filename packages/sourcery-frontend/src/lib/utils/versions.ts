export function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
	const parts = version.replace('v', '').split('.');
	const major = parseInt(parts[0]) || 0;
	const minor = parseInt(parts[1]) || 0;
	const patch = parseInt(parts[2]) || 0;
	if (type === 'major') {
		return `v${major + 1}.0.0`;
	} else if (type === 'minor') {
		return `v${major}.${minor + 1}.0`;
	} else {
		return `v${major}.${minor}.${patch + 1}`;
	}
}