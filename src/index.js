/**
 * Miku dark skin, host half.
 *
 * The skin is browser presentation only: the empty apply exists so the package
 * owns a Loader row, while the browser half ships through `exports["./client"]`
 * and is discovered through the package.json `dsh.client` declaration.
 */
export const name = 'dsh-plugin-miku-skin'

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply() {}
