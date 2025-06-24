document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseButton = document.querySelector('.upload-area__browse');
    const uploadButton = document.getElementById('uploadBtn');

    let selectedFile = null;

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Browse button click handler
    browseButton.addEventListener('click', function() {
        fileInput.click();
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (isValidFileType(file)) {
                handleFileSelect(file);
                fileInput.files = files; // Update the input
            } else {
                showError('Invalid file type. Please select a CSV or Excel file.');
            }
        }
    });

    // Upload button click handler
    uploadButton.addEventListener('click', function() {
        if (selectedFile) {
            uploadFile(selectedFile);
        } else {
            showError('Please select a file first.');
        }
    });

    // Handle file selection
    function handleFileSelect(file) {
        if (!isValidFileType(file)) {
            showError('Invalid file type. Please select a CSV or Excel file.');
            return;
        }

        selectedFile = file;
        browseButton.textContent = `Choose File - ${file.name}`;
        browseButton.style.color = '#DAA520';
        uploadButton.disabled = false;

        // Update upload area appearance
        uploadArea.style.borderColor = '#DAA520';
        uploadArea.style.backgroundColor = '#fffbf0';

        showSuccess(`File "${file.name}" selected successfully.`);
    }

    // Validate file type
    function isValidFileType(file) {
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        const allowedExtensions = ['.csv', '.xls', '.xlsx'];

        return allowedTypes.includes(file.type) ||
            allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    }

    // Upload file function
    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Update button state
        uploadButton.disabled = true;
        uploadButton.innerHTML = `
            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            UPLOADING...
        `;

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showSuccess(`File uploaded successfully! ${result.recordsProcessed || 0} records processed.`);
                resetUploadArea();
                // Refresh the upload log
                await refreshUploadLog();
            } else {
                const error = await response.json();
                showError(error.message || 'Upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            uploadButton.disabled = false;
            uploadButton.innerHTML = `
                UPLOAD DATA
                <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
    }

    // Reset upload area
    function resetUploadArea() {
        selectedFile = null;
        fileInput.value = '';
        browseButton.textContent = 'Choose File - None Chosen';
        browseButton.style.color = '#666';
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.backgroundColor = '#fafafa';
    }

    // Show success message
    function showSuccess(message) {
        showNotification(message, 'success');
    }

    // Show error message
    function showError(message) {
        showNotification(message, 'error');
    }

    // Show notification
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <svg class="notification__icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    ${type === 'success'
            ? '<path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
            : '<path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        }
                </svg>
                <span class="notification__message">${message}</span>
                <button class="notification__close" onclick="this.parentElement.parentElement.remove()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Refresh upload log
    async function refreshUploadLog() {
        try {
            const response = await fetch('/api/upload-log');
            if (response.ok) {
                const logs = await response.json();
                updateUploadLogDisplay(logs);
            }
        } catch (error) {
            console.error('Failed to refresh upload log:', error);
        }
    }

    // Update upload log display
    function updateUploadLogDisplay(logs) {
        const logContainer = document.querySelector('.upload-log__entries');
        if (!logContainer || !logs || logs.length === 0) return;

        logContainer.innerHTML = logs.map(log => `
            <div class="log-entry">
                <div class="log-entry__avatar">
                    <img src="${log.avatar || '/images/user-avatar.png'}" alt="${log.userName}">
                </div>
                <div class="log-entry__content">
                    <div class="log-entry__name">${log.userName}</div>
                    <div class="log-entry__date">${formatDate(log.uploadDate)}</div>
                </div>
                <div class="log-entry__action">
                    <button class="log-entry__btn" onclick="viewDataSet('${log.id}')">${log.fileName || 'View Data Set'}</button>
                </div>
            </div>
        `).join('');
    }

    // Format date helper
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // View data set function
    window.viewDataSet = function(logId) {
        window.location.href = `/admin/data/${logId}`;
    };

    // Add CSS for notifications
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        }

        .notification--success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }

        .notification--error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }

        .notification__content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
        }

        .notification__icon {
            flex-shrink: 0;
        }

        .notification__message {
            flex: 1;
            font-weight: 500;
        }

        .notification__close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            color: inherit;
            opacity: 0.7;
            transition: opacity 0.2s;
        }

        .notification__close:hover {
            opacity: 1;
        }

        .spinner {
            animation: spin 1s linear infinite;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `;

    // Inject notification styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);

    // Load initial upload log
    refreshUploadLog();
});