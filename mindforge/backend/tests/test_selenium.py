from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Using your specific Chrome 147 driver path
service = Service(r"C:\Users\BRINDA\Downloads\147.0.7727.57 chromedriver-win64\chromedriver-win64\chromedriver.exe")
driver = webdriver.Chrome(service=service)

try:
    print("Starting Refinement Check...")
    driver.get("http://localhost:5173")
    driver.maximize_window()
    wait = WebDriverWait(driver, 60)

    # --- STEP 1: INITIAL INPUT ---
    print("Step 1: Submitting initial idea...")
    input_box = wait.until(EC.presence_of_element_located((By.ID, "idea-textarea")))
    input_box.send_keys("Design a smart home IoT system")
    driver.find_element(By.ID, "initial-generate-btn").click()

    # --- STEP 2: REFINEMENT VALIDATION ---
    print("Step 2: Validating Clarification Panel...")
    # Wait for the clarification panel to appear
    wait.until(EC.presence_of_element_located((By.ID, "additional-context")))
    
    final_btn = driver.find_element(By.ID, "final-generate-btn")
    
    # Check if button is initially disabled
    if not final_btn.is_enabled():
        print("  [SUCCESS] Generate button is disabled initially.")
    else:
        print("  [FAIL] Generate button should be disabled until questions are answered.")

    # Answer questions one by one
    questions = driver.find_elements(By.CSS_SELECTOR, "div.space-y-8 > div.space-y-4")
    print(f"  - Found {len(questions)} questions.")

    for i, q in enumerate(questions, 1):
        # Click the first option for this question
        options = q.find_elements(By.TAG_NAME, "button")
        if options:
            options[0].click()
            print(f"  - Answered question {i}")
            time.sleep(0.5)

    # --- STEP 3: ADDITIONAL CONTEXT ---
    print("Step 3: Adding additional context...")
    context_area = driver.find_element(By.ID, "additional-context")
    context_area.send_keys("Focus on energy efficiency and security.")

    # --- STEP 4: SUBMISSION ---
    if final_btn.is_enabled():
        print("  [SUCCESS] Generate button is now enabled.")
        final_btn.click()
    else:
        print("  [FAIL] Generate button is still disabled after answering all questions.")
    
    
    # 4. Result Phase
    print("Step 4: Waiting for Mind Map generation...")
    # Wait for the mind map SVG to appear
    try:
        wait.until(EC.presence_of_element_located((By.ID, "mindmap-svg")))
    except:
        # Check if there is an error message displayed on the page
        error_elements = driver.find_elements(By.CSS_SELECTOR, ".bg-red-500\\/90")
        if error_elements:
            print(f"  [ERROR] Page shows error: {error_elements[0].text}")
        else:
            print("  [ERROR] Mind map SVG did not appear and no error message found.")
        raise
    
    # Check if the title is displayed
    title = driver.find_element(By.CSS_SELECTOR, "h2.text-2xl.font-bold").text
    print(f"Successfully generated mind map: {title.encode('ascii', 'ignore').decode('ascii')}")
    
    print("\n[TEST PASSED] Full pipeline from input to mind map completion works!")


except Exception as e:
    print(f"\n[TEST FAILED]: {str(e)}")
finally:
    driver.quit()
