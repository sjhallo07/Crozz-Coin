import { appConfig, isConfigured } from '../lib/config';

export function ConfigNotice()
{
    if (isConfigured) return null;

    return (
        <div className="panel warning-panel">
            <h3>Finish configuration</h3>
            <p>
                Update the root <code>.env</code> file with your real <code>VITE_SUI_PACKAGE_ID</code>,{' '}
                <code>VITE_SUI_TREASURY_STATE_ID</code>, and <code>VITE_SUI_COIN_TYPE</code> before sending
                admin transactions. The admin and treasury capability IDs can also be auto-discovered when the
                connected wallet owns them.
            </p>
            <ul>
                <li>Current package: <code>{appConfig.packageId}</code></li>
                <li>Current admin cap: <code>{appConfig.adminCapId}</code></li>
                <li>Current treasury cap: <code>{appConfig.treasuryCapId}</code></li>
                <li>Current treasury state: <code>{appConfig.treasuryStateId}</code></li>
                <li>Current coin type: <code>{appConfig.coinType}</code></li>
            </ul>
        </div>
    );
}
