// DOM Elements
const form = document.getElementById('requestForm');
const formContainer = document.getElementById('formContainer');
const successContainer = document.getElementById('successContainer');
const submissionsContainer = document.getElementById('submissionsContainer');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');

// Form validation rules
const validationRules = {
    studentName: {
        required: true,
        minLength: 2,
        message: 'Please enter your full name (at least 2 characters)'
    },
    courseYear: {
        required: true,
        minLength: 3,
        message: 'Please enter your course and year'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    websiteType: {
        required: true,
        message: 'Please select the type of website you need'
    },
    budget: {
        required: true,
        message: 'Please select your budget range'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load submissions count for display
    updateSubmissionsCount();
    
    // Add form validation listeners
    addFormValidation();
    
    // Add form submit handler
    form.addEventListener('submit', handleFormSubmit);
});

// Form validation
function addFormValidation() {
    Object.keys(validationRules).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName.replace(/([A-Z])/g, '').toLowerCase() + 'Error');
        
        if (field && errorElement) {
            // Real-time validation on blur
            field.addEventListener('blur', () => validateField(field, errorElement));
            
            // Clear error on input
            field.addEventListener('input', () => clearError(field, errorElement));
        }
    });
}

function validateField(field, errorElement) {
    const rules = validationRules[field.name];
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (rules.required && !field.value.trim()) {
        isValid = false;
        errorMessage = rules.message;
    }
    
    // Length validation
    else if (rules.minLength && field.value.trim().length < rules.minLength) {
        isValid = false;
        errorMessage = rules.message;
    }
    
    // Pattern validation (for email)
    else if (rules.pattern && !rules.pattern.test(field.value.trim())) {
        isValid = false;
        errorMessage = rules.message;
    }

    // Display validation result
    if (!isValid) {
        showError(field, errorElement, errorMessage);
    } else {
        clearError(field, errorElement);
    }

    return isValid;
}

function showError(field, errorElement, message) {
    field.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
}

function clearError(field, errorElement) {
    field.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
}

// Form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    let isFormValid = true;
    Object.keys(validationRules).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName.replace(/([A-Z])/g, '').toLowerCase() + 'Error');
        
        if (field && errorElement) {
            const fieldValid = validateField(field, errorElement);
            if (!fieldValid) {
                isFormValid = false;
            }
        }
    });

    if (!isFormValid) {
        // Scroll to first error
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Show loading state
    setLoadingState(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Collect form data
    const formData = new FormData(form);
    const submission = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        studentName: formData.get('studentName'),
        courseYear: formData.get('courseYear'),
        email: formData.get('email'),
        websiteType: formData.get('websiteType'),
        budget: formData.get('budget'),
        timeline: formData.get('timeline') || 'Not specified',
        instructions: formData.get('instructions') || 'No additional instructions provided',
        status: 'pending'
    };

    // Save to localStorage
    saveSubmission(submission);

    // Show success message
    setLoadingState(false);
    showSuccess();

    // Reset form
    form.reset();

    // Update submissions count
    updateSubmissionsCount();
}

function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        btnLoading.innerHTML = '<span class="loading"></span>Submitting...';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
    }
}

// localStorage operations
function saveSubmission(submission) {
    const submissions = getSubmissions();
    submissions.unshift(submission); // Add to beginning of array
    localStorage.setItem('websiteRequests', JSON.stringify(submissions));
}

function getSubmissions() {
    const submissions = localStorage.getItem('websiteRequests');
    return submissions ? JSON.parse(submissions) : [];
}

function updateSubmissionsCount() {
    const submissions = getSubmissions();
    const count = submissions.length;
    
    // Update any submission counters if needed
    // This could be expanded to show count in UI
}

// Navigation functions
function showSuccess() {
    formContainer.style.display = 'none';
    submissionsContainer.style.display = 'none';
    successContainer.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showForm() {
    formContainer.style.display = 'block';
    successContainer.style.display = 'none';
    submissionsContainer.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function viewSubmissions() {
    formContainer.style.display = 'none';
    successContainer.style.display = 'none';
    submissionsContainer.style.display = 'block';
    
    // Load and display submissions
    displaySubmissions();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displaySubmissions() {
    const submissions = getSubmissions();
    const submissionsList = document.getElementById('submissionsList');

    if (submissions.length === 0) {
        submissionsList.innerHTML = `
            <div class="empty-state">
                <h3>No submissions yet</h3>
                <p>You haven't submitted any website requests yet.</p>
                <button class="btn-primary" onclick="showForm()" style="margin-top: 1rem;">Submit Your First Request</button>
            </div>
        `;
        return;
    }

    const submissionsHTML = submissions.map(submission => `
        <div class="submission-card">
            <div class="submission-header">
                <div class="submission-title">${submission.websiteType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div class="submission-date">${formatDate(submission.timestamp)}</div>
            </div>
            
            <div class="submission-details">
                <div class="submission-detail">
                    <strong>Name:</strong>
                    ${submission.studentName}
                </div>
                <div class="submission-detail">
                    <strong>Course & Year:</strong>
                    ${submission.courseYear}
                </div>
                <div class="submission-detail">
                    <strong>Email:</strong>
                    ${submission.email}
                </div>
                <div class="submission-detail">
                    <strong>Budget:</strong>
                    ${submission.budget.replace('-', ' - ₱')}
                </div>
                <div class="submission-detail">
                    <strong>Timeline:</strong>
                    ${submission.timeline}
                </div>
                <div class="submission-detail">
                    <strong>Status:</strong>
                    <span style="color: var(--warning-500); font-weight: 500;">Pending Review</span>
                </div>
            </div>
            
            ${submission.instructions !== 'No additional instructions provided' ? `
                <div class="submission-instructions">
                    <strong>Special Instructions:</strong>
                    ${submission.instructions}
                </div>
            ` : ''}
        </div>
    `).join('');

    submissionsList.innerHTML = submissionsHTML;
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export data function (could be useful for the developer)
function exportSubmissions() {
    const submissions = getSubmissions();
    const dataStr = JSON.stringify(submissions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `website-requests-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Email functionality (for future implementation)
function generateEmailContent(submission) {
    return `
Subject: Website Request - ${submission.studentName}

Hello!

A new website request has been submitted:

Student Name: ${submission.studentName}
Course & Year: ${submission.courseYear}
Email: ${submission.email}
Website Type: ${submission.websiteType}
Budget: ${submission.budget}
Timeline: ${submission.timeline}

Special Instructions:
${submission.instructions}

Submitted on: ${formatDate(submission.timestamp)}

---
Website Request Platform
`.trim();
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    // ESC key to go back to form
    if (e.key === 'Escape') {
        if (successContainer.style.display === 'block' || submissionsContainer.style.display === 'block') {
            showForm();
        }
    }
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Auto-save draft functionality (optional enhancement)
function saveDraft() {
    const formData = new FormData(form);
    const draft = {};
    
    for (let [key, value] of formData.entries()) {
        if (value.trim()) {
            draft[key] = value;
        }
    }
    
    if (Object.keys(draft).length > 0) {
        localStorage.setItem('websiteRequestDraft', JSON.stringify(draft));
    }
}

function loadDraft() {
    const draft = localStorage.getItem('websiteRequestDraft');
    if (draft) {
        const draftData = JSON.parse(draft);
        Object.keys(draftData).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = draftData[key];
            }
        });
    }
}

function clearDraft() {
    localStorage.removeItem('websiteRequestDraft');
}

// Load draft on page load
// document.addEventListener('DOMContentLoaded', loadDraft);

// Save draft periodically
// setInterval(saveDraft, 30000); // Save every 30 seconds