from django.urls import path
from . import views

urlpatterns = [
    path('',views.index,name="home"),
    path('register/',views.registerV,name="register"),
    path('login/',views.loginV,name="login"),
    path('logout/',views.logoutV,name="logout"),
    path('add/',views.addTask,name="addTask"),
    path('completeState/<int:id>',views.changeCompleteState,name="completeState"),
    path('task/<int:id>',views.edit,name="editTask"),
    path('history/',views.history,name="history"),
    path('delete/<int:id>',views.deleteTask,name="delete")
]
