/**
 * Auth system test — 6 scenarios
 */
async function test() {
    const base = 'http://localhost:5000/api/auth';
    let pass = 0, fail = 0;

    async function check(label, expected, email, password, isSignup = false, name) {
        const url = isSignup ? `${base}/signup` : `${base}/login`;
        const body = isSignup ? { name, email, password } : { email, password };
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const d = await r.json();
        const result = d.success === expected;
        if (result) { console.log(`  ✓ ${label}`); pass++; }
        else { console.log(`  ✗ ${label} — got: ${JSON.stringify(d)}`); fail++; }
    }

    console.log('\n=== Auth System Tests ===\n');
    await check('Login - valid credentials', true, 'john@example.com', '123456');
    await check('Login - wrong password', false, 'john@example.com', 'wrongpass');
    await check('Login - non-existent email', false, 'nobody@test.com', 'abc');
    await check('Signup - new user', true, 'newuser@test.com', 'pass123', true, 'New User');
    await check('Signup - duplicate email', false, 'newuser@test.com', 'pass123', true, 'New User');
    await check('Login - newly signed up user', true, 'newuser@test.com', 'pass123');

    console.log(`\n=== Results: ${pass} passed, ${fail} failed ===\n`);
}

test().catch(e => console.error('Error:', e.message));
