#!/usr/bin/env python3
"""
NutriMed Backend API Testing Suite
Tests all API endpoints for the NutriMed nutrition management application
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class NutriMedAPITester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"\n{status} - {name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")

    def test_health_endpoint(self) -> bool:
        """Test the health check endpoint"""
        try:
            response = self.session.get(f"{self.api_base}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ['status', 'timestamp', 'database', 'supabase', 'services']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test(
                        "Health Check - Response Structure", 
                        False, 
                        f"Missing fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Check database connection
                db_connected = data.get('database', {}).get('connected', False)
                supabase_connected = data.get('supabase', {}).get('connected', False)
                
                self.log_test(
                    "Health Check - API Response", 
                    True, 
                    f"Status: {data.get('status')}, DB: {db_connected}, Supabase: {supabase_connected}",
                    {
                        "status": data.get('status'),
                        "database_connected": db_connected,
                        "supabase_connected": supabase_connected,
                        "response_time": data.get('responseTime')
                    }
                )
                return True
            else:
                self.log_test(
                    "Health Check - API Response", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Health Check - Connection", 
                False, 
                f"Connection error: {str(e)}"
            )
            return False
        except Exception as e:
            self.log_test(
                "Health Check - Unexpected Error", 
                False, 
                f"Error: {str(e)}"
            )
            return False

    def test_dashboard_stats_endpoint(self) -> bool:
        """Test dashboard stats endpoint (requires authentication)"""
        try:
            response = self.session.get(f"{self.api_base}/dashboard/stats", timeout=10)
            
            if response.status_code == 401:
                self.log_test(
                    "Dashboard Stats - Authentication Required", 
                    True, 
                    "Correctly returns 401 for unauthenticated request"
                )
                return True
            elif response.status_code == 200:
                data = response.json()
                expected_fields = ['targetCalories', 'consumedCalories', 'targetProtein', 'consumedProtein']
                
                has_required_fields = all(field in data for field in expected_fields)
                self.log_test(
                    "Dashboard Stats - Response Structure", 
                    has_required_fields, 
                    f"Has required fields: {has_required_fields}",
                    data if has_required_fields else None
                )
                return has_required_fields
            else:
                self.log_test(
                    "Dashboard Stats - Unexpected Status", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Dashboard Stats - Error", 
                False, 
                f"Error: {str(e)}"
            )
            return False

    def test_nutrition_summary_endpoint(self) -> bool:
        """Test nutrition summary endpoint"""
        try:
            response = self.session.get(f"{self.api_base}/nutrition/summary", timeout=10)
            
            if response.status_code == 401:
                self.log_test(
                    "Nutrition Summary - Authentication Required", 
                    True, 
                    "Correctly returns 401 for unauthenticated request"
                )
                return True
            elif response.status_code == 200:
                data = response.json()
                expected_fields = ['macroData', 'pieChartData', 'weeklyData', 'totalCalories']
                
                has_required_fields = all(field in data for field in expected_fields)
                self.log_test(
                    "Nutrition Summary - Response Structure", 
                    has_required_fields, 
                    f"Has required fields: {has_required_fields}",
                    data if has_required_fields else None
                )
                return has_required_fields
            else:
                self.log_test(
                    "Nutrition Summary - Unexpected Status", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Nutrition Summary - Error", 
                False, 
                f"Error: {str(e)}"
            )
            return False

    def test_meals_today_endpoint(self) -> bool:
        """Test today's meals endpoint"""
        try:
            response = self.session.get(f"{self.api_base}/meals/today", timeout=10)
            
            if response.status_code == 401:
                self.log_test(
                    "Meals Today - Authentication Required", 
                    True, 
                    "Correctly returns 401 for unauthenticated request"
                )
                return True
            elif response.status_code == 200:
                data = response.json()
                
                # Should return an array of meals
                is_array = isinstance(data, list)
                self.log_test(
                    "Meals Today - Response Format", 
                    is_array, 
                    f"Returns array: {is_array}",
                    {"meal_count": len(data) if is_array else 0}
                )
                return is_array
            else:
                self.log_test(
                    "Meals Today - Unexpected Status", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Meals Today - Error", 
                False, 
                f"Error: {str(e)}"
            )
            return False

    def test_foods_endpoint(self) -> bool:
        """Test foods endpoint"""
        try:
            response = self.session.get(f"{self.api_base}/foods", timeout=10)
            
            if response.status_code in [200, 401]:
                self.log_test(
                    "Foods Endpoint - Accessibility", 
                    True, 
                    f"Endpoint accessible (HTTP {response.status_code})"
                )
                return True
            else:
                self.log_test(
                    "Foods Endpoint - Status", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Foods Endpoint - Error", 
                False, 
                f"Error: {str(e)}"
            )
            return False

    def test_profile_endpoint(self) -> bool:
        """Test profile endpoint"""
        try:
            response = self.session.get(f"{self.api_base}/profile", timeout=10)
            
            if response.status_code in [200, 401]:
                self.log_test(
                    "Profile Endpoint - Accessibility", 
                    True, 
                    f"Endpoint accessible (HTTP {response.status_code})"
                )
                return True
            else:
                self.log_test(
                    "Profile Endpoint - Status", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Profile Endpoint - Error", 
                False, 
                f"Error: {str(e)}"
            )
            return False

    def test_application_accessibility(self) -> bool:
        """Test if the main application is accessible"""
        try:
            response = self.session.get(self.base_url, timeout=10)
            
            if response.status_code == 200:
                # Check if it's a valid HTML response
                content_type = response.headers.get('content-type', '')
                is_html = 'text/html' in content_type
                
                self.log_test(
                    "Application - Main Page", 
                    is_html, 
                    f"HTTP {response.status_code}, Content-Type: {content_type}"
                )
                return is_html
            else:
                self.log_test(
                    "Application - Main Page", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text[:200] if response.text else None
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Application - Connection", 
                False, 
                f"Error: {str(e)}"
            )
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests"""
        print("🚀 Starting NutriMed Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Test application accessibility first
        app_accessible = self.test_application_accessibility()
        
        # Test health endpoint
        health_ok = self.test_health_endpoint()
        
        # Test protected endpoints (should return 401 without auth)
        dashboard_ok = self.test_dashboard_stats_endpoint()
        nutrition_ok = self.test_nutrition_summary_endpoint()
        meals_ok = self.test_meals_today_endpoint()
        
        # Test other endpoints
        foods_ok = self.test_foods_endpoint()
        profile_ok = self.test_profile_endpoint()

        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        # Critical issues
        critical_issues = []
        if not app_accessible:
            critical_issues.append("Application not accessible")
        if not health_ok:
            critical_issues.append("Health endpoint failing")
            
        if critical_issues:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in critical_issues:
                print(f"   - {issue}")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "critical_issues": critical_issues,
            "app_accessible": app_accessible,
            "health_check_passed": health_ok,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = NutriMedAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    if results["critical_issues"]:
        print(f"\n❌ Tests completed with critical issues")
        return 1
    elif results["success_rate"] >= 80:
        print(f"\n✅ Tests completed successfully")
        return 0
    else:
        print(f"\n⚠️  Tests completed with some failures")
        return 1

if __name__ == "__main__":
    sys.exit(main())