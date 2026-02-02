from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from .forms import CustomUserCreationForm, TaskForm
from .models import Task
from datetime import date, datetime
import json
from django.http import Http404, JsonResponse, HttpResponse

# Create your views here.

@login_required
def index(request):
    user = request.user
    tasks = Task.objects.filter(user=user).filter(added_on = date.today())
    
    
    # all logic for percentage bar
    totalTasks = tasks.count()
    totalTasksCompleted = tasks.filter(is_complete=True).count()
    
    return render(request,"task/index.html",{
        "tasks":tasks,
        "totalTasks":totalTasks,
        "totalTaskCompleted":totalTasksCompleted
    })


def registerV(request):
    where = 'register'
    alter = 'login'
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("home")
    else:
        form = CustomUserCreationForm()
    return render(request,"task/form.html",{
        "form":form,
        "alter":alter,
        "where":where
    })

def loginV(request):
    where = 'login'
    alter = 'register'
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                login(request,user)
                return redirect("home")
    else:
        form = AuthenticationForm()
    return render(request,"task/form.html",{
        "form":form,
        "alter":alter,
        "where":where
    })

def logoutV(request):
    logout(request)
    return redirect("home")



@login_required
def addTask(request):
    where = 'addTask'
    alter = 'home'
    if request.method == "POST":
        form = TaskForm(request.POST)
        if form.is_valid():
            instance = form.save(commit=False)
            instance.user = request.user
            instance.save()
            return redirect("home")
    else :
        form = TaskForm()
    return render(request,"task/form.html",{
        "form":form,
        "where":where,
        "alter":alter
    })
    

@login_required 
def changeCompleteState(request,id):
    if request.method == "PUT":
        task = Task.objects.filter(pk=id,user=request.user).first()
        if task is not None:
            data = json.loads(request.body.decode('utf-8'))
            task.is_complete = data['is_complete']
            task.save()
            return JsonResponse({"message": "task status updated."}, status=201)
        return JsonResponse({"error": "id provided is not right."}, status=400)
    return JsonResponse({"error": "PUT request required."}, status=400)



@login_required
def edit(request,id):
    task = Task.objects.filter(pk=id,user=request.user).first()
    if task is not None:
       if (request.method == "POST"):
           form = TaskForm(request.POST,instance=task)
           if form.is_valid():
               form.save()
               return redirect("home")
       else:
           form = TaskForm(instance=task)
       return render(request,"task/editTask.html",{
           "form":form,
           "task":task
       })
    raise Http404("The task not found")


@login_required
def history(request):
    isMore = True
    user = request.user
    if (request.method == "POST"):
        data = json.loads(request.body.decode("utf-8"))
        current:str = data.get('currentDate')
        previous:str = data.get('previousDate')
        currentDateTime = datetime.fromisoformat(current.replace('Z', '+00:00'))
        previousDateTime = datetime.fromisoformat(previous.replace('Z', '+00:00'))
        tasks = Task.objects.filter(user=user,added_on__lte = currentDateTime,added_on__gte = previousDateTime).order_by("-added_on")
        if (tasks.count() == 0):
            newTask = Task.objects.filter(user=user,added_on__lte = currentDateTime).order_by("-added_on")
            isMore = False
            if (newTask.count() == 0):
                return JsonResponse({'error': 'no more tasks'}, status=400)
            tasks = newTask
        taskWithDates = {"ismore":isMore}
        for task in tasks:
            addedon = str(task.added_on.strftime("%d-%b-%Y"))
            if (taskWithDates.get(addedon) != None): 
                    taskWithDates[addedon].append({"title":task.title,"description":task.description})
            else:
                    taskWithDates[addedon] = [{"title":task.title,"description":task.description}]
        return JsonResponse(taskWithDates)
    return HttpResponse("invalid Request")
        
        
        
@login_required
def deleteTask(request,id):
    user = request.user
    task = Task.objects.filter(user=user,pk=id).first()
    if task is not None:
        task.delete()
        return redirect("home")
    return Http404("Task Not Found")