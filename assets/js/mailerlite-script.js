// Newsletter form handling
class NewsletterForm {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        const form = this.container.querySelector('.newsletter-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        } else {
            console.error('Newsletter form not found');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const checkbox = form.querySelector('input[type="checkbox"]');

        if (!email || !checkbox.checked) {
            alert('Please fill in all required fields');
            return;
        }

        // Show loading spinner
        const primaryButton = form.querySelector('button.primary');
        primaryButton.style.display = 'none';

        const loadingButton = form.querySelector('button.loading');
        const loadingSpinner = loadingButton.querySelector('.loading-indicator');

        loadingButton.style.display = 'inline-flex';
        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch('https://assets.mailerlite.com/jsonp/1042482/forms/130941196381980229/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fields: { email },
                    anticsrf: true
                })
            });

            if (response.ok) {
                this.showSuccess();
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to subscribe. Please try again later.');

            // Hide loading spinner and restore submit button
            loadingButton.style.display = 'none';
            loadingSpinner.style.display = 'none';
            primaryButton.style.display = 'inline-flex';
        }
    }

    showSuccess() {
        const formBody = this.container.querySelector('.newsletter-body');
        const successBody = this.container.querySelector('.newsletter-success');

        if (formBody && successBody) {
            formBody.style.display = 'none';
            successBody.style.display = 'block';
        }
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NewsletterForm('newsletter-form-container');
});
