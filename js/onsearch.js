/*
 * Copyright (C) 2012, 2016 DuckDuckGo, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * On tabs programmatically updated with chrome.tabs.update as a result of some
 * user input into the omnibox, the focus stays on the omnibox even when the
 * content of the tab has been fully loaded. This is unintuitive behavior, as
 * on any other omnibox interaction the omnibox would lose focus once the
 * requested page is loaded. Unfortunately, Chrome doesn't offer any solutions
 * to this problem, other than the very clumsy creation of a new tab and
 * removal of the current one in rapid succession, which would also result in
 * losing the opener tab's history. To add fuel to the fire, tabbing out of the
 * omnibox brings focus to the search input field, which is not the desired
 * user experience on the result page as it blocks keyboard navigation through
 * the search results.
 *
 * To mitigate the problem, this content script gets injected on every search
 * initiated from the extension, and shifts any explicitly specified positive
 * tabindices by one, giving the tabindex "1" to the body, where the focus
 * would normally be having searched through the DuckDuckGo UI. This way, while
 * the updated tab's focus remains on the omnibox nonetheless, at least hitting
 * the Tab key once will bring keyboard navigation through the results within
 * reasonable reach.
 */

document.querySelectorAll('[tabindex]').forEach((element) => {
  if (element.tabIndex > 0) {
    element.tabIndex = element.tabIndex + 1;
  }
});

document.body.tabIndex = 1;
