PS C:\Users\qw284\IdeaProjects\springboot> git log 
commit d38aa56ad31c0329ccd38a94786b9ba41e3ed31c (HEAD -> master, origin/master)
Date:   Mon Feb 19 12:49:08 2024 +0800

    過年後，同步+重新閱讀一下

commit f74fa6460bc6b9807899693bf4366b50413934c8
Date:   Thu Oct 26 11:04:27 2023 +0800

    五連面之後 > Authenticate 讓它如果傳入格式錯誤 不只回傳400 而是更詳細的錯誤訊息
    ( 把 @Validate 遇到的 @NonBlank 的消息拋出)，
    所以我把Authenticate改回傳使用 ResponseEntity<?> 通用格式 ， 
    並且增加Lombok、Jackson Example 資料夾裡面很方便! 
    然後順帶提BigDecimal在TestProject下


commit cfa6c5aad3d7cc150709b27a933e45ff76e71ae6 (origin/Chapter23, Chapter23)
Date:   Tue Oct 24 16:12:24 2023 +0800

    Chapter23 > 修復各種TEST錯誤，並且跟著做SWAPPER! 
    pom.xml檔案需要加上 io.github.classgraph/classgraph/4.8.139，
    否則只跟著文中加入一個springdoc會找不到github方法。
    Test錯誤主要有 AppUserTest testAuthenticartByPriceAsc、
    testSearchProductsSortByPriceAsc_mockSeparate 新增pricefrom避免拋出錯誤 ，
    原因皆在各自方法下描述。resources 下 (安裝ubantu)的這個檔案內補充了從
    外往postman送資料過去怎麼做，
    【2023/10/23 網路溝通mongodb問題、讓外網可以連接mytutu】
    這個區塊有寫怎麼做。原作者使用的是SpringBoot2.45+JDK11他的版本跟我的不同，
    所以請到pom.xml看。使用不同的dependency就可以解面來隔離API note 避免複雜化

commit 25bffb0c02883e3f3e3778c7e323d4b021fe211d (origin/Chapter22, Chapter22)
Date:   Sun Oct 22 00:27:11 2023 +0800

    Chapter22 > UserServiceTest頭上根本不需要太多注釋只要MockitoJUnitRunner就夠。
    關於finNameLikeIgnoreCase我也順便小改一下使用@Query因為有點奇怪，
    居然不包含輸入數字(兩者)本身，然後關於JwtService也有修改，
    讓 主要就是用來溝通API，不是只有TEST可以使用，
    平時需要聯絡URL API也可以很方便使用!

commit 99569dcc0c2a87a9b805b203d74cf1102742e831
Date:   Tue Oct 17 00:27:43 2023 +0800

    CH21-1 > 學習文件TestProject Knowledges Docker下面，
    在本專案Resources找到_MongoDB4Learn，
    有特別備份過來放這!這次更新主要是 testLoadSpringUserButNotFound() 
    這邊的邏輯有問題 修改過了，並且學習如何使用docker 
    建立ubuntu使用jdk+maven+nano+mongodb，測試不認識的人的SpringBoot專案。

commit e37b624e3fbff3d0c65175b00b2138dafce54bd4 (origin/Chapter21, Chapter21)
Date:   Sat Oct 14 21:59:07 2023 +0800

    Chapter21 > 學習 Mockito ，ProductServiceTest 
    有拿UserIdentity來用 <學習用 mock 做假的>，
    前一章AOP好像就有使用到這個類別。
    UserDetailsService 有個夥伴 SpringUserService 
    (基本一模一樣但是下面這位有在authenticationProvider() 中被調用，
    前者則無人調用，這邊我沒使用SpringUserService雖然我有創造他哈哈哈)
    ，We know that Beans of Same Interface can be read by 
    Spring ApplicationContext at same time without 
    ambiguous assignment situation.
    (e.g. @Qualifier less ，前述內容於UserServiceTest)，
    總之學習怎麼使用@mock、@InjectMocks 
    (transitive dependencies 要小心自己好好處理，只有direct dependencies 會被正確注入).

commit d26add3e83d252e1dc1a4bc459e95a2fa6baaaf1 (origin/Chapter20, Chapter20)
Date:   Thu Oct 12 23:07:37 2023 +0800

    Chapter20 > 寫AOP 跟@interface這個神奇東西，剛好GoogleCredential過期，
    service有文件教怎麼辦。另外就是GlobalException有改，
    Builder使用方法之前用錯所以回傳null，這次改過了。
    此外我的Mail設定也有點不同所以 要費點腦，
    不然估計有點難讀懂。大概摸過就可以了，知道就行，剩下靠實戰時拿出來練。

commit 75dbec7d7dbe79106436d5d4b0724ecd9b897bf8 (origin/Ch17-19, Ch17-19)
Date:   Tue Oct 10 20:45:21 2023 +0800

    CH17-19 > 加入springSecurity 到這邊使用跟練習， 
    GlobalExceptionHandler 自訂錯誤時的回應主體ResponseEntity<CustomBadResponse> 
    跟 /error permitAll 讓錯誤顯現而不是Always forbidden。順帶一提SpringUser就是 
    把AppUser包裹然後implements UserDetails 讓JwtService生成toekn。

commit c685eeb79426c8b14e55d8049224deb3468d777f (origin/Chapter16, Chapter16)
Date:   Mon Oct 2 09:03:36 2023 +0800

    CH16 > LogApiFilter 這章重點放在這了，幾本上就是stream特性掌握，
    知道filter處理順序，及為什麼getInputStream後 
    才能讓ContentCachingRequestWrapper 的getContentAsByteArrays 
    能夠觸發，不再為empty，因為getInputStream只能被觸發一次，
    而@RequestBody 必定使用它所以在這之前誰都不能用，只能留給controller。

commit 8d1382f588c34f48e124ed3e2d807685bc0c29d9 (origin/Chapter15, Chapter15)
Date:   Sat Sep 30 22:46:30 2023 +0800

建新的實例(delete調用兩次所以...)

commit 873679bfd9508ab57a50b428d6a4b36442d6ea65
Date:   Sat Sep 30 20:09:38 2023 +0800

     CH15 > 第二次up 這邊測試CGLIB跟JDK 調用時間差距! 
     基於500介面(JDK) 與 500方法(CGLIB) 和 基於1介面(JDK)跟1方法(CGLIB)， 
     兩方時間差距 <使用proxyMode 每次調用都生成來比較>

commit f31971bc2d679bb9d7039ba66ad423acb7b7660f
Date:   Sat Sep 30 16:15:21 2023 +0800

     CH15 >這邊先up一次，增加AOP CGLIB JDK 的相關知識 。
     這一次主要去看Compose內AOPController驗證(PostMan測試)，
     注意properties暫時設定成預設jdk代理，以及特別改final JDK_instance，
     證明final可以代理但是要有實作介面跟預設使用JDK 
     而且實際使用也必須用介面寫程式，對於想要使用原始類其他方法而言多少不便利，
     所以springboot預設用CGLIB，透過getClass可以發現跟直接打印變數是不同的類別 。

commit 997a76fe0e172176a50f15ae6a4cc84cd679c30e
Date:   Tue Sep 26 20:09:18 2023 +0800

    CH14 > 越來越不同了，我沒有像他那樣設定多個MailService 
    然後或者用@Qualifier或者用配置properties去改，
    我唯一跟他做的只有Service弄成Config的bean

commit ef15bc54fc9bf1fd4f72c79b9ad8df890771feb6 (origin/Chapter13, Chapter13)
Date:   Tue Sep 26 00:06:17 2023 +0800

    CH13 > 我的版本是使用OAuth+GoogleMailAPI認證安全性更高但也需要配置，
    總之成功引渡過來這個專案(原本在我們的期末專案上)，
    影片https://www.youtube.com/watch?v=xtZI23hxetw&t=1342s，
    權證json下載後必須不動其名 稱，直接複製到resources下，改了就不能用了。

commit 801b651610f2fa45eb5a18f845c5e5f6e4c108a6 (origin/Chapter12, Chapter12)
Date:   Mon Sep 25 16:30:17 2023 +0800

    CH12 > classes重新分pacakage並且把controller跟service中的方法順序
    調整按照GET POST PUT DEL，然後service方法盡量用重載，
    controller方法則是註解保留，以及自己找Errors
    建立CustomBadResponse可以讓驗證失敗產生 的錯誤訊息精細點，
    而非只有BadRequest或ValidationError count{1}之類!

commit b70288b3ee18575a861b984a9b1d5aaef552839c (origin/Chapter11, Chapter11)
Date:   Sat Sep 23 20:31:45 2023 +0800

    CH11 跟 maven 小bug +廢廢爬蟲+檔案路徑問題的Filemaker

commit a959807b498f827d7c53190aafc5ef321b8b6e76 (origin/Chapter10, Chapter10)
Date:   Fri Sep 22 21:33:45 2023 +0800

    第十章MockMvc整合測試(二)

commit 25ed59709962a66199f3a2034892bf1993a9a483 (origin/Chapter9, Chapter9)
Date:   Thu Sep 21 21:09:00 2023 +0800

    第九課，教你怎麼使用Mockmvc，而不必透過postman測試，
    屬於Integration Test整合、各部分元件的測試

commit 986d58ef0c6041eef9126c7573b306dae739e7e3
Date:   Wed Sep 20 23:35:54 2023 +0800

    睡覺去，把git一些基本補上暫時先這樣

commit 109722229b9789d3c404b26af3a5f37efe3568bc
Date:   Wed Sep 20 15:27:48 2023 +0800

    不測刪除檔案怎麼git回復了

commit d62cfff26c8e61a14e23d757934bf65e86243380
Date:   Wed Sep 20 15:20:55 2023 +0800

    重新測這次有加入文字進去

commit 47246d12fedd755f556bf8db48fc79ef230052c9
Date:   Wed Sep 20 15:01:36 2023 +0800

    這次有包含'測試刪除資料對分支跟commit影響' 這份file

commit 0bd4c3c30e07e7ba757cd414e346041b4106d7dd (origin/Chapter8, Chapter8)
Date:   Wed Sep 20 14:55:37 2023 +0800

    尚未新增 測試刪除資料對分支跟commit影響 這個文件

commit 21c082cac5e57a63702951c20b9ac50956aa9480
Date:   Wed Sep 20 14:34:09 2023 +0800

    git使用指令寫在主程式上

commit 3e9b2f8ca0eb8a12ba8ba188be3179a380ba3117
Date:   Wed Sep 20 14:21:30 2023 +0800

    目前為止到第8章(沒有認真去做NoSQL語法實作)

commit 5e67669d6057432291d969fda9b612ff58e6c45c
Date:   Tue Sep 19 22:57:20 2023 +0800

    今天上傳兩次，這是第3次純多餘測試，這次可以保留DBinitializer但是註解它，改成InitialClearDB了，特別放到DBConfiguration裡面，目前使用前會強制初始

commit ecf5338f7f740ed9652b50ca653856f3b9c698df
Date:   Tue Sep 19 22:52:59 2023 +0800

    今天上傳兩次，這是第3次，這次可以保留DBinitializer但是註解它，改成InitialClearDB了，特別放到DBConfiguration裡面，目前使用前會強制初始

commit e6d8bbc74311fecf9534dc2a46641c7181e36074
Date:   Tue Sep 19 22:45:42 2023 +0800

    今天上傳兩次，這是第二次，這次可以保留DBinitializer但是註解它，改成InitialClearDB了，特別放到DBConfiguration裡面，目前使用前會強制初始化

commit be6c2b66b6e3867c213ee17b0113229e9939f24c
Date:   Tue Sep 19 22:15:34 2023 +0800

    今天上傳兩次，這是第一次，主要展現差異在於DatabaseInitializer這邊@Override run 不會先跑因為它是方法而非Autowired的注入構造函數內容

commit 779d3176000b727cf32c3e4baa8252bad0909559
Date:   Fri Sep 15 23:15:38 2023 +0800

    lesson05_Done_GlobalExceptionHandler & git_knowledge

commit 0730190efa61f17ddf2a8cc71980ffb953b3867b
Date:   Fri Sep 15 13:37:27 2023 +0800

    FirstTimeUpload-lesson4
PS C:\Users\qw284\IdeaProjects\springboot> 
