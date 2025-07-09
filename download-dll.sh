#!/bin/bash

# LibreHardwareMonitorLib.dll Download Script
# Downloads the required DLL from the official LibreHardwareMonitor GitHub repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://api.github.com/repos/LibreHardwareMonitor/LibreHardwareMonitor/releases/latest"
DLL_TARGET_DIR="backend/fastapi"
DLL_NAME="LibreHardwareMonitorLib.dll"
TEMP_DIR="/tmp/librehardwaremonitor"

echo -e "${BLUE}🔧 LibreHardwareMonitor DLL Download Script${NC}"
echo -e "${BLUE}===========================================${NC}"

# Function to check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is not installed${NC}"
        echo -e "${YELLOW}💡 Install with: sudo apt-get install curl (Ubuntu/Debian) or brew install curl (macOS)${NC}"
        exit 1
    fi
    
    if ! command -v unzip &> /dev/null; then
        echo -e "${RED}❌ unzip is not installed${NC}"
        echo -e "${YELLOW}💡 Install with: sudo apt-get install unzip (Ubuntu/Debian) or brew install unzip (macOS)${NC}"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq is not installed${NC}"
        echo -e "${YELLOW}💡 Install with: sudo apt-get install jq (Ubuntu/Debian) or brew install jq (macOS)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies are available${NC}"
}

# Function to create target directory
create_target_dir() {
    if [ ! -d "$DLL_TARGET_DIR" ]; then
        echo -e "${YELLOW}⚠️  Target directory doesn't exist. Creating...${NC}"
        mkdir -p "$DLL_TARGET_DIR"
        echo -e "${GREEN}✅ Target directory created: $DLL_TARGET_DIR${NC}"
    fi
}

# Function to get latest release information
get_latest_release() {
    echo -e "${BLUE}🔍 Fetching latest release information...${NC}"
    
    # Get latest release info from GitHub API
    local release_info=$(curl -s "$REPO_URL")
    
    if [ $? -ne 0 ] || [ -z "$release_info" ]; then
        echo -e "${RED}❌ Failed to fetch release information${NC}"
        echo -e "${YELLOW}💡 Check your internet connection and try again${NC}"
        exit 1
    fi
    
    # Extract download URL for the zip file
    DOWNLOAD_URL=$(echo "$release_info" | jq -r '.assets[] | select(.name | test(".*\\.zip$")) | .browser_download_url' | head -1)
    VERSION=$(echo "$release_info" | jq -r '.tag_name')
    
    if [ -z "$DOWNLOAD_URL" ] || [ "$DOWNLOAD_URL" = "null" ]; then
        echo -e "${RED}❌ Could not find download URL for the latest release${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Found latest release: $VERSION${NC}"
    echo -e "${BLUE}📦 Download URL: $DOWNLOAD_URL${NC}"
}

# Function to download and extract the DLL
download_and_extract() {
    echo -e "${BLUE}📥 Downloading LibreHardwareMonitor release...${NC}"
    
    # Create temp directory
    mkdir -p "$TEMP_DIR"
    
    # Download the zip file
    curl -L -o "$TEMP_DIR/librehardwaremonitor.zip" "$DOWNLOAD_URL"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to download the release${NC}"
        cleanup_temp
        exit 1
    fi
    
    echo -e "${GREEN}✅ Download completed${NC}"
    
    # Extract the zip file
    echo -e "${BLUE}📂 Extracting archive...${NC}"
    unzip -q "$TEMP_DIR/librehardwaremonitor.zip" -d "$TEMP_DIR/"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to extract the archive${NC}"
        cleanup_temp
        exit 1
    fi
    
    echo -e "${GREEN}✅ Archive extracted${NC}"
}

# Function to find and copy the DLL
find_and_copy_dll() {
    echo -e "${BLUE}🔍 Searching for $DLL_NAME...${NC}"
    
    # Search for the DLL file in the extracted contents
    DLL_PATH=$(find "$TEMP_DIR" -name "$DLL_NAME" -type f | head -1)
    
    if [ -z "$DLL_PATH" ]; then
        echo -e "${RED}❌ Could not find $DLL_NAME in the downloaded archive${NC}"
        echo -e "${YELLOW}💡 Available files:${NC}"
        find "$TEMP_DIR" -name "*.dll" -type f
        cleanup_temp
        exit 1
    fi
    
    echo -e "${GREEN}✅ Found DLL: $DLL_PATH${NC}"
    
    # Copy the DLL to the target directory
    echo -e "${BLUE}📋 Copying DLL to target directory...${NC}"
    cp "$DLL_PATH" "$DLL_TARGET_DIR/$DLL_NAME"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to copy DLL to target directory${NC}"
        cleanup_temp
        exit 1
    fi
    
    echo -e "${GREEN}✅ DLL copied successfully to $DLL_TARGET_DIR/$DLL_NAME${NC}"
}

# Function to verify the DLL
verify_dll() {
    echo -e "${BLUE}🔍 Verifying DLL installation...${NC}"
    
    if [ -f "$DLL_TARGET_DIR/$DLL_NAME" ]; then
        local file_size=$(stat -f%z "$DLL_TARGET_DIR/$DLL_NAME" 2>/dev/null || stat -c%s "$DLL_TARGET_DIR/$DLL_NAME" 2>/dev/null)
        echo -e "${GREEN}✅ DLL verified: $DLL_NAME (${file_size} bytes)${NC}"
        echo -e "${BLUE}📍 Location: $(pwd)/$DLL_TARGET_DIR/$DLL_NAME${NC}"
        return 0
    else
        echo -e "${RED}❌ DLL verification failed${NC}"
        return 1
    fi
}

# Function to cleanup temporary files
cleanup_temp() {
    if [ -d "$TEMP_DIR" ]; then
        echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
        rm -rf "$TEMP_DIR"
        echo -e "${GREEN}✅ Cleanup completed${NC}"
    fi
}

# Function to show usage instructions
show_usage_instructions() {
    echo -e "\n${BLUE}📋 Usage Instructions:${NC}"
    echo -e "${GREEN}✅ LibreHardwareMonitorLib.dll is now ready for use${NC}"
    echo -e "\n${YELLOW}📝 Next steps:${NC}"
    echo -e "1. Install Python dependencies: ${BLUE}pip install -r backend/fastapi/requirements.txt${NC}"
    echo -e "2. Start the backend server: ${BLUE}python backend/fastapi/main.py${NC}"
    echo -e "3. The DLL will be automatically loaded by the HardwareMonitor package"
    echo -e "\n${YELLOW}⚠️  Important Notes:${NC}"
    echo -e "• Hardware monitoring requires administrator privileges on Windows"
    echo -e "• On Linux/macOS, hardware monitoring capabilities may be limited"
    echo -e "• The DLL is platform-specific (Windows .NET assembly)"
    echo -e "\n${BLUE}🔗 More info: https://github.com/LibreHardwareMonitor/LibreHardwareMonitor${NC}"
}

# Main execution
main() {
    # Check if DLL already exists
    if [ -f "$DLL_TARGET_DIR/$DLL_NAME" ]; then
        echo -e "${YELLOW}⚠️  DLL already exists at $DLL_TARGET_DIR/$DLL_NAME${NC}"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}ℹ️  Keeping existing DLL${NC}"
            exit 0
        fi
        echo -e "${YELLOW}🔄 Overwriting existing DLL...${NC}"
    fi
    
    # Execute main steps
    check_dependencies
    create_target_dir
    get_latest_release
    download_and_extract
    find_and_copy_dll
    
    # Verify and cleanup
    if verify_dll; then
        cleanup_temp
        show_usage_instructions
        echo -e "\n${GREEN}🎉 LibreHardwareMonitor DLL installation completed successfully!${NC}"
    else
        cleanup_temp
        exit 1
    fi
}

# Handle script interruption
trap cleanup_temp INT TERM

# Check if script is run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi